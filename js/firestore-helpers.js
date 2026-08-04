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
 * The one query every listing-browsing page is built on. See the
 * design note above: always the same shape (approved + available,
 * newest first), so it needs exactly one composite index, ever.
 * getListings(), searchListings(), and market.html's richer
 * filtering (district, price range, verified-only) all start from
 * this same fetch rather than querying Firestore separately.
 */
async function getAllActiveListings() {
  const snap = await db.collection("listings")
    .where("isApproved", "==", true)
    .where("status", "==", "available")
    .orderBy("createdAt", "desc")
    .limit(LISTINGS_FETCH_CAP)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetches approved, available listings for public browsing, with
 * basic category/district filtering and sorting applied in JS.
 * See getAllActiveListings() above for why this isn't a Firestore
 * query with these filters built in.
 *
 * filters: { categorySlug, district, sort }
 * sort: "newest" (default) | "price_asc" | "price_desc" | "quantity_desc"
 */
async function getListings(filters = {}) {
  let items = await getAllActiveListings();

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
    // default: already newest-first from getAllActiveListings()
  }

  return items;
}

/**
 * Simple client-side text search across product name, category,
 * district, and location. Firestore doesn't support full-text
 * search natively; for MVP scale this is fine. If the catalog
 * grows large, revisit with Algolia/Typesense or a `searchTerms`
 * array field.
 */
async function searchListings(queryText) {
  const items = await getAllActiveListings();
  const needle = queryText.trim().toLowerCase();
  return items.filter((listing) =>
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
    // NOTE: no "|| 'Farmer'" fallback here on purpose. firestore.rules
    // now pins sellerName to exactly match users/{uid}.fullName on
    // every listing write — if this sent a different fallback string,
    // the write would be rejected whenever fullName happens to be
    // empty. Any "Farmer" display fallback belongs at render time
    // instead (see listing.html), not in the stored value.
    sellerName: sellerProfile.fullName || "",
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

/**
 * NOTE: because listings/{id} read rules require isApproved == true
 * (or the caller being the seller/admin) per document, and this
 * function does a chunked "in" query across arbitrary listing IDs,
 * a favourite pointing at a listing that later became unapproved,
 * sold-and-removed, or deleted by another user can cause that
 * specific chunk's read to behave inconsistently depending on
 * Firestore's handling of mixed-visibility "in" queries. In
 * practice this only bites if a favourited listing's visibility
 * changes after the fact — rare at MVP scale, but worth knowing if
 * a saved listing mysteriously fails to appear on dashboard-buyer.html.
 */
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

async function getUserProfileById(userId) {
  const doc = await db.collection("users").doc(userId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * Private contact info (phone, email) lives in a subcollection,
 * NOT on the public users/{uid} doc — see firestore.rules. Only the
 * account owner can read or write this document; calling this for
 * anyone other than the signed-in user will fail the security rule.
 */
async function getUserPrivateContact(userId) {
  const doc = await db.collection("users").doc(userId)
    .collection("private").doc("contact").get();
  return doc.exists ? doc.data() : null;
}

async function updateUserPrivateContact(userId, updates) {
  await db.collection("users").doc(userId)
    .collection("private").doc("contact")
    .set(updates, { merge: true });
}

/**
 * Updates the PUBLIC users/{uid} doc only. phone and email must
 * never land here — see users/{uid}/private/contact and
 * updateUserPrivateContact() above for those two fields instead.
 * Any phone/email passed in `updates` is stripped before the write,
 * and any legacy copy left over on an account from before this
 * public/private split existed is actively deleted on every save —
 * this is how older accounts self-migrate over time as people
 * revisit profile.html.
 */
async function updateUserProfile(userId, updates) {
  const { phone, email, ...safeUpdates } = updates;
  await db.collection("users").doc(userId).set({
    ...safeUpdates,
    phone: firebase.firestore.FieldValue.delete(),
    email: firebase.firestore.FieldValue.delete(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

/* ---------- Admin ---------- */
/**
 * Everything in this section relies on firestore.rules granting
 * isAdmin() broader read/write access than a normal signed-in user
 * gets (see firestore.rules: listings read/update, reports
 * read/update/delete). These functions do not check admin status
 * themselves — that's requireAdmin() in auth.js, called by
 * admin.html before any of these run. If a non-admin somehow calls
 * these directly, Firestore's own rules reject the request; this
 * is defense in depth, not the actual boundary.
 */

/**
 * Listings awaiting moderation (isApproved == false). Only an
 * admin can read these for sellers other than themselves — see
 * the listings read rule in firestore.rules.
 */
async function getPendingListings() {
  const snap = await db.collection("listings")
    .where("isApproved", "==", false)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function approveListing(listingId) {
  return updateListing(listingId, { isApproved: true });
}

/**
 * Reports still awaiting admin action. status starts "open" (see
 * createReport above) and moves to "resolved" or "dismissed".
 */
async function getOpenReports() {
  const snap = await db.collection("reports")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function resolveReport(reportId) {
  await db.collection("reports").doc(reportId).update({ status: "resolved" });
}

async function deleteReport(reportId) {
  await db.collection("reports").doc(reportId).delete();
}

const ADMIN_USERS_FETCH_CAP = 100;

/**
 * Most-recently-joined users, for the admin verification list.
 * Firestore has no text search (see searchListings() above for
 * the same limitation) — at MVP admin scale, browsing by recency
 * is enough. Revisit with a real search index if the user base
 * grows past a page or two of scrolling.
 */
async function getRecentUsersForAdmin() {
  const snap = await db.collection("users")
    .orderBy("createdAt", "desc")
    .limit(ADMIN_USERS_FETCH_CAP)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
