/* ============================================================
   AUTH HELPERS
   ------------------------------------------------------------
   Shared across every page. Depends on firebase-config.js
   being loaded first.

   IMPORTANT: Anything here is for UI convenience only
   (showing/hiding buttons, redirecting). It is NOT a security
   boundary. The real enforcement lives in firestore.rules.
   Never trust a client-side role check alone.
   ============================================================ */

/**
 * ADMIN_UIDS: a hardcoded allowlist of Firebase Auth UIDs that
 * are treated as admins.
 *
 * Why hardcoded and not a Firestore field like `isAdmin: true`?
 * Because any field on a user's own document can be edited by
 * that user unless rules explicitly forbid it — and a boolean
 * flag is exactly the kind of thing that's easy to accidentally
 * leave writable. A hardcoded list checked in security rules
 * cannot be changed from the browser at all.
 *
 * The real long-term approach is Firebase Auth custom claims,
 * set via the Admin SDK from a trusted server (e.g. a Cloud
 * Function), which requires a backend process we don't have yet.
 * This allowlist is the honest MVP stand-in for that — you set
 * your own UID here AND in firestore.rules by hand. It is not
 * meant to scale past a small number of admins.
 */
const ADMIN_UIDS = [
  // "PASTE_YOUR_FIREBASE_UID_HERE"
];

function isAdminUid(uid) {
  return ADMIN_UIDS.includes(uid);
}

/**
 * Filenames this app will ever redirect back to after login or
 * registration. Anything not on this list is rejected — see
 * sanitizeRedirect() below.
 */
const ALLOWED_REDIRECT_PAGES = [
  "index.html", "market.html", "listing.html", "sell.html",
  "dashboard-farmer.html", "dashboard-buyer.html", "profile.html",
  "admin.html",
];

/**
 * Validates a "redirect" query param value before it's ever used
 * in window.location.href. Without this, a link like
 * login.html?redirect=https%3A%2F%2Fevil.example.com sends
 * someone through a completely legitimate login on the real
 * domain, then off to a phishing page right after — a classic
 * open-redirect used for phishing.
 *
 * We allow-list known page filenames rather than trying to block
 * every dangerous form (javascript:, //host, https://host, a
 * backslash trick, etc.) — allow-listing is what actually closes
 * this off completely, since a deny-list is always one encoding
 * trick behind.
 */
function sanitizeRedirect(dest) {
  if (!dest) return "index.html";

  let decoded;
  try {
    decoded = decodeURIComponent(dest);
  } catch (e) {
    return "index.html";
  }

  const pathOnly = decoded.split(/[?#]/)[0];
  const basename = pathOnly.split("/").pop();

  return ALLOWED_REDIRECT_PAGES.includes(basename) ? decoded : "index.html";
}

/**
 * Waits for Firebase Auth to resolve the current user on page load.
 * Firebase's auth state is asynchronous — on a fresh page load it's
 * briefly unknown whether someone is logged in. Use this instead of
 * reading auth.currentUser directly on page load.
 */
function onAuthReady() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/* ---------- Email/password ---------- */

async function registerWithEmail(email, password) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  return cred.user;
}

async function loginWithEmail(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

async function sendPasswordReset(email) {
  await auth.sendPasswordResetEmail(email);
}

/* ---------- Google Sign-In ---------- */

/**
 * Starts Google Sign-In using the redirect flow rather than a
 * popup. Popups are unreliable on mobile browsers — they can be
 * blocked outright, or silently fail inside in-app/webview
 * browsers. Redirect sends the whole page to Google and back,
 * which works consistently on Android browsers like Chrome or
 * Brave. This function navigates away immediately; there is
 * nothing to await afterward on this page load.
 */
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithRedirect(provider);
}

/**
 * Call this once on every page load that might be the return trip
 * from signInWithGoogle() (login.html and register.html at least).
 * Returns the signed-in user if this page load was a redirect
 * return, or null otherwise — check this before onAuthReady() so
 * you don't miss a fresh Google sign-in.
 */
async function handleGoogleRedirectResult() {
  const result = await auth.getRedirectResult();
  return result && result.user ? result.user : null;
}

/* ---------- Profile bootstrapping ---------- */

/**
 * Ensures a Firestore profile document exists for a signed-in
 * user. Needed because Google Sign-In only gives us a name, email,
 * and photo — not phone, role, or district, which our schema
 * requires. On first sign-in this creates a minimal public profile
 * plus a private/contact doc (see firestore-helpers.js) with those
 * fields blank; the calling page should then check
 * profileNeedsCompletion() and route the user to fill them in
 * before they can list or contact anyone.
 *
 * Safe to call after every sign-in (Google or email) — it's a
 * no-op (beyond re-reading) if a profile already exists.
 *
 * The returned `profile` object merges the public doc with the
 * private/contact doc so callers can keep reading profile.phone /
 * profile.email exactly as before, even though neither field lives
 * on the public users/{uid} doc anymore.
 */
async function ensureUserProfile(user) {
  const ref = db.collection("users").doc(user.uid);
  const doc = await ref.get();

  if (doc.exists) {
    const privateContact = await getUserPrivateContact(user.uid).catch(() => null);
    return {
      profile: { id: doc.id, ...doc.data(), ...(privateContact || {}) },
      isNew: false,
    };
  }

  const minimalPublicProfile = {
    fullName: user.displayName || "",
    role: "", // "farmer" | "buyer" | "both" — set during profile completion
    district: "",
    location: "",
    bio: "",
    avatarUrl: user.photoURL || "",
    isVerified: false,
    whatsappPublic: false,
    publicPhone: "", // only ever set to a real number when whatsappPublic is on
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  const privateContact = {
    phone: "",
    email: user.email || "",
  };

  const batch = db.batch();
  batch.set(ref, minimalPublicProfile);
  batch.set(ref.collection("private").doc("contact"), privateContact);
  await batch.commit();

  return {
    profile: { id: user.uid, ...minimalPublicProfile, ...privateContact },
    isNew: true,
  };
}

/**
 * True if a profile is missing fields Google Sign-In can't supply.
 * Pages should check this right after sign-in/registration and
 * redirect to a "complete your profile" step if true, before
 * letting the user sell or contact a seller.
 */
function profileNeedsCompletion(profile) {
  return !profile || !profile.role || !profile.phone || !profile.district;
}

/**
 * Fetches the current user's full profile (public doc merged with
 * the private/contact doc) from Firestore. Returns null if not
 * logged in or no profile exists yet.
 */
async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const doc = await db.collection("users").doc(user.uid).get();
  if (!doc.exists) return null;
  const privateContact = await getUserPrivateContact(user.uid).catch(() => null);
  return { id: doc.id, ...doc.data(), ...(privateContact || {}) };
}

/* ---------- Guards ---------- */

/**
 * Redirects to login.html if not authenticated, preserving the
 * intended destination so login can bounce back after success.
 */
async function requireAuth() {
  const user = await onAuthReady();
  if (!user) {
    const dest = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?redirect=${dest}`;
    return null;
  }
  return user;
}

/**
 * Guards admin.html. Checks the hardcoded allowlist only —
 * mirrors what firestore.rules enforces server-side.
 */
async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  if (!isAdminUid(user.uid)) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

async function logout() {
  await auth.signOut();
  window.location.href = "index.html";
}
