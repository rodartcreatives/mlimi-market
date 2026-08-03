/* ============================================================
   FIREBASE CONFIG
   ------------------------------------------------------------
   This config object is PUBLIC by design. Firebase web config
   (apiKey, projectId, etc.) is meant to be visible in client
   code — it identifies your project, it does not authenticate
   requests. Real security comes from:
     1. Firestore Security Rules (firestore.rules)
     2. Storage Security Rules (storage.rules)
     3. Firebase Auth requiring sign-in for writes
   Never assume hiding this object provides any protection.
   ============================================================ */

// TODO: Replace with your actual Firebase project config
// (Firebase Console > Project Settings > General > Your apps > SDK setup)
const firebaseConfig = {
  apiKey: "AIzaSyBj08gQ7qST7XXCUOfobzC5cFthg2A6vV8",
  authDomain: "agri-connect-265.firebaseapp.com",
  projectId: "agri-connect-265",
  storageBucket: "agri-connect-265.firebasestorage.app",
  messagingSenderId: "665315531867",
  appId: "1:665315531867:web:c9163438065c1c9f47737e"
};

// Using the "compat" SDK (global firebase object, no import syntax)
// deliberately — this is editable in QuickEdit without a bundler,
// same pattern as Bajeti Yanga.
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// NOTE: Firebase Storage is intentionally not initialized here.
// Since Feb 2026, Cloud Storage for Firebase requires the Blaze
// (pay-as-you-go) plan, which requires a linked billing card —
// a real barrier for many Malawian accounts. Produce photos are
// hosted on Cloudinary instead (see cloudinary-config.js and
// uploadListingImage() in ui-helpers.js), which has a genuine
// no-card free tier with unsigned client-side uploads. Auth and
// Firestore are unaffected by Firebase's Storage policy change
// and remain free on the Spark plan.

// Persist login across app restarts (mobile browser / PWA context)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
  console.warn("Could not set auth persistence:", err);
});
