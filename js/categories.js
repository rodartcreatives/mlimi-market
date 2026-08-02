/* ============================================================
   CATEGORIES
   ------------------------------------------------------------
   Fixed produce categories, hardcoded rather than stored in
   Firestore. These aren't user-editable content — they're a
   small, stable taxonomy — so there's no benefit to a database
   round-trip, and no risk of the app looking empty just because
   a `categories` collection was never seeded.

   Listings store the slug directly (categorySlug field), plus a
   denormalized categoryName for text search — see
   firestore-helpers.js. Look up display name/icon from here
   using getCategoryBySlug().
   ============================================================ */

const CATEGORIES = [
  { slug: "maize", name: "Maize", icon: "maize" },
  { slug: "beans", name: "Beans", icon: "beans" },
  { slug: "groundnuts", name: "Groundnuts", icon: "groundnuts" },
  { slug: "rice", name: "Rice", icon: "rice" },
  { slug: "potatoes", name: "Potatoes", icon: "potatoes" },
  { slug: "tomatoes", name: "Tomatoes", icon: "tomatoes" },
  { slug: "onions", name: "Onions", icon: "onions" },
  { slug: "poultry", name: "Poultry", icon: "poultry" },
  { slug: "livestock", name: "Livestock", icon: "livestock" },
  { slug: "other", name: "Other", icon: "sprout" },
];

function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
