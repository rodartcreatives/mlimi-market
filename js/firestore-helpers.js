/* ============================================================
   FIRESTORE HELPERS
   ------------------------------------------------------------
   Shared read/write functions. Depends on firebase-config.js.

   Denormalization note: listing docs store sellerName,
   sellerVerified, and district directly on the listing, rather
   than requiring a second read per card to look up the seller.
   Firestore has no server-side JOINs, so this trade (slightly
   stale display fields vs. an extra read per listing on every
   browse) is the right one for a browsing-heavy marketplace.
   If a seller's name changes, existing listing cards show the
   old name until that listing is next edited — acceptable for
   MVP, worth revisiting if it becomes confusing.
   ============================================================ */

const LISTINGS_FETCH_CAP = 200; // safety cap on the single Firestore query below

/* ---------- Categories ---------- */
/**
 * Firestore-backed categories are NOT used for MVP — see
 * categories.js for the static CATEGORIES list actually used by
 * the app. This function is kept only in case category
 * management is ever moved into Firestore/admin.html later.
 */
async function getActiveCategories() {
  const snap = await db.collection("categories")
    .where("isActive", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------- Listings ---------- */

/**
 * Fetches approved, available listings for public browsing.
 *
 * DESIGN NOTE: Firestore requires a composite index for any query
 * that combines multiple `where` filters with an `orderBy`. If
 * category, district, and each sort option were all applied at
 * the query level, nearly every filter combination would need its
 * own manually-created index in the Firebase Console — impractical
 * for a one-person, phone-only setup. Instead, Firestore always
 * runs the exact same query (approved + available, newest first),
 * which needs exactly one composite index, ever. Category/district
 * filtering and alternate sorting happen here in JavaScript
 * afterward. At MVP scale (dozens to low hundreds of listings)
 * this costs nothing noticeable; if the marketplace grows into the
 * thousands, this is the first place to revisit.
 *
 * filters: { categorySlug, district, sort }
 * sort: "newest" (default) | "price_asc" | "price_desc" | "quantity_desc"
 */
async function getListings(filters = {}) {
  const snap = await db.collection("listings")
    .where("isApproved", "==", true)
    .where("status", "==", "available")
    .orderBy("createdAt", "desc")
    .limit(LISTINGS_FETCH_CAP)
    .get();

  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (filters.categorySlug) {
    items = items.filter((l) => l.categorySlug === filters.categorySlug);
  }
  if (filters.district) {
    items = items.filter((l) => l.district === filters.district);
  }

  switch (filters.sort) {
    case "price_asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "quantity_desc":
      items.sort((a, b) => b.quantity - a.quantity);
      break;
    // default: already newest-first from the query above
  }

  return items;
}

/**
 * Simple client-side text search across product name.
 * Firestore doesn't support full-text search natively; for MVP
 * scale this is fine. If the catalog grows large, revisit with
 * Algolia/Typesense or a `searchTerms` array field.
 */
async function searchListings(queryText) {
  const snap = await db.collection("listings")
    .where("isApproved", "==", true)
    .where("status", "==", "available")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const needle = queryText.trim().toLowerCase();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((listing) =>
      listing.productName?.toLowerCase().includes(needle) ||
      listing.categoryName?.toLowerCase().includes(needle) ||
      listing.district?.toLowerCase().includes(needle) ||
      listing.location?.toLowerCase().includes(needle)
    );
}

async function getListingById(id) {
  const doc = await db.collection("listings").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getListingsBySeller(sellerId) {
  const snap = await db.collection("listings")
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Creates a new listing. isApproved starts false — moderation
 * queue picks it up. Seller info is denormalized at write time
 * from the profile passed in.
 */
async function createListing(listingData, sellerProfile) {
  const payload = {
    ...listingData,
    sellerId: sellerProfile.id,
    sellerName: sellerProfile.fullName || "Farmer",
    sellerVerified: !!sellerProfile.isVerified,
    status: "available",
    isApproved: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection("listings").add(payload);
  return ref.id;
}

async function updateListing(listingId, updates) {
  await db.collection("listings").doc(listingId).update({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function markListingSold(listingId) {
  return updateListing(listingId, { status: "sold" });
}

async function deleteListing(listingId) {
  await db.collection("listings").doc(listingId).delete();
}

/* ---------- Favourites ---------- */

function favouriteDocId(userId, listingId) {
  return `${userId}_${listingId}`;
}

async function isFavourited(userId, listingId) {
  const doc = await db.collection("favourites").doc(favouriteDocId(userId, listingId)).get();
  return doc.exists;
}

async function toggleFavourite(userId, listingId) {
  const ref = db.collection("favourites").doc(favouriteDocId(userId, listingId));
  const doc = await ref.get();
  if (doc.exists) {
    await ref.delete();
    return false;
  }
  await ref.set({
    userId,
    listingId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return true;
}

async function getFavouriteListings(userId) {
  const favSnap = await db.collection("favourites").where("userId", "==", userId).get();
  const listingIds = favSnap.docs.map((d) => d.data().listingId);
  if (!listingIds.length) return [];

  // Firestore 'in' queries cap at 30 — fine for a saved-listings list at MVP scale
  const chunks = [];
  for (let i = 0; i < listingIds.length; i += 30) {
    chunks.push(listingIds.slice(i, i + 30));
  }
  const results = [];
  for (const chunk of chunks) {
    const snap = await db.collection("listings")
      .where(firebase.firestore.FieldPath.documentId(), "in", chunk)
      .get();
    results.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
  return results;
}

/* ---------- Reports ---------- */

async function createReport(reporterId, listingId, reason, description) {
  await db.collection("reports").add({
    reporterId,
    listingId,
    reason,
    description: description || "",
    status: "open",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/* ---------- Enquiries ---------- */

async function createEnquiry(buyerId, sellerId, listingId, message) {
  await db.collection("enquiries").add({
    buyerId,
    sellerId,
    listingId,
    message,
    status: "sent",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function getEnquiriesForBuyer(buyerId) {
  const snap = await db.collection("enquiries")
    .where("buyerId", "==", buyerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getEnquiriesForSeller(sellerId) {
  const snap = await db.collection("enquiries")
    .where("sellerId", "==", sellerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------- Profiles ---------- */

async function updateUserProfile(userId, updates) {
  await db.collection("users").doc(userId).set({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

/* ---------- Future: wanted_requests ----------
   Not built in this MVP pass. Modeled here in comments so the
   shape is agreed before the matching engine is built later.

   wanted_requests document shape:
   {
     buyerId, productName, categorySlug, quantity, unit,
     district, location, maxPrice, priceType,
     neededBy, status: "open" | "fulfilled" | "expired",
     createdAt
   }

   Eventual matching engine (Cloud Function, NOT client-side):
   on listing create/update -> query wanted_requests where
   status == "open" and categorySlug/district match -> notify
   matching buyers. Keeping categorySlug/district/quantity/price
   field names consistent between listings and wanted_requests
   now is what makes that diff cheap later.
------------------------------------------------------------ */
