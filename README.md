# Mlimi Market

*"Sell your produce. Find your market."*

A Malawi-focused agricultural marketplace connecting farmers with buyers. Built as static, dependency-free HTML/CSS/JS — no build tools, no npm — deployable directly via GitHub Pages and editable from any text editor, including on a phone.

## Status

🚧 Step 1: Project shell — in progress. See build order below.

## Stack

- **Frontend:** Plain HTML/CSS/JS, one file per screen. Shared code lives in `/js` and `/css`.
- **Backend:** Firebase (Auth, Firestore) + Cloudinary (image hosting)
- **Hosting:** GitHub Pages
- **No framework, no bundler, no npm required to run or edit this project.**

### Why Cloudinary instead of Firebase Storage

Since February 2026, Cloud Storage for Firebase requires the Blaze (pay-as-you-go) plan, which requires linking a billing card. That's a real barrier depending on where you're banking from — so produce photos are hosted on Cloudinary instead, which has a genuine no-card free tier (25 credits/month; 1 credit = 1GB storage, 1GB bandwidth, or 1,000 transformations) and supports unsigned uploads straight from the browser, no backend required. Auth and Firestore are unaffected by Firebase's Storage change and stay on the free Spark plan.

## Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password sign-in method
3. Enable **Firestore Database**
4. Copy your Firebase web config into `js/firebase-config.js` (replace the `YOUR_...` placeholders)
5. Deploy the Firestore rules: copy the contents of `firestore.rules` into Firebase Console → Firestore → Rules
6. Sign up free at [cloudinary.com](https://cloudinary.com) (no card required)
   - Copy your **Cloud name** from the dashboard into `js/cloudinary-config.js`
   - Go to Settings → Upload → Upload presets → Add upload preset
   - Set Signing Mode to **Unsigned**
   - Restrict it: allowed formats `jpg, png, webp`, max file size ~2MB, folder `mlimi-market/listings`
   - Copy the preset name into `js/cloudinary-config.js`
7. Find your own Firebase Auth UID (Console → Authentication → Users, after you register your own account in the app) and add it to the admin allowlist in **both**:
   - `js/auth.js` → `ADMIN_UIDS` array
   - `firestore.rules` → `isAdmin()` function
8. Seed the `categories` collection manually in Firestore console (see Categories below) — or via `admin.html` once built.
9. Push to GitHub, enable GitHub Pages on the repo (Settings → Pages → deploy from branch)

`storage.rules` is kept in the repo for reference but isn't currently deployed anywhere — see the note at the top of that file.

## Why these choices

**Firebase config is public on purpose.** The config object in `firebase-config.js` (apiKey, projectId, etc.) is meant to be visible in client code — it identifies the project, it does not authenticate anything. Real security is `firestore.rules` + `storage.rules` + requiring sign-in for writes. Never assume hiding this file protects anything.

**Admin access is a hardcoded UID allowlist, not a database field.** A field like `isAdmin: true` on a user's own profile document is dangerous — unless rules are written very carefully, a user could potentially write to their own document and grant themselves admin. Real custom-claims-based admin (set via the Firebase Admin SDK from a trusted server) is the correct long-term approach, but that needs a backend process this project doesn't have yet. The allowlist is the honest MVP stand-in: you set your UID by hand in two files, and no browser action can change it.

**No build tools.** Every file here is meant to be opened, read, and edited directly — in QuickEdit, in a plain text editor, in GitHub's web editor. Firebase is loaded via CDN `<script>` tags using the "compat" SDK (global `firebase` object), not the modern modular SDK, because the modular SDK requires `import` syntax and a bundler to work reliably.

**Firestore denormalizes seller info onto listings.** Firestore has no server-side JOINs. Rather than doing a second read per listing card to fetch seller name/verification, that data is copied onto the listing document when it's created. Trade-off: if a seller's name changes, old listings show the old name until next edited. Acceptable for MVP.

## Folder structure

```
mlimi-market/
├── index.html                 Landing/Home
├── market.html                 Browse Market
├── listing.html                Listing Details (?id=xxx)
├── sell.html                   Sell Produce (multi-step form)
├── dashboard-farmer.html        Farmer Dashboard
├── dashboard-buyer.html         Buyer Dashboard
├── profile.html                 User Profile
├── login.html
├── register.html
├── admin.html                   Admin Dashboard (protected)
├── firestore.rules              Firestore security rules
├── storage.rules                Storage security rules
├── /js
│   ├── firebase-config.js       Firebase init (public config)
│   ├── cloudinary-config.js     Cloudinary cloud name + unsigned preset
│   ├── auth.js                  Session/role helpers, admin allowlist
│   ├── firestore-helpers.js     Shared CRUD functions
│   ├── ui-helpers.js            Toasts, states, WhatsApp links, image compression
│   └── nav.js                   Bottom nav bar injector
├── /css
│   └── shared.css               Design tokens + base styles
└── /assets
```

## Database (Firestore collections)

- **`users`** — profile per Firebase Auth UID: fullName, phone, email, role (farmer/buyer/both), district, location, bio, avatarUrl, isVerified, whatsappPublic
- **`categories`** — name, slug, icon, isActive, sortOrder
- **`listings`** — sellerId, categoryId, productName, description, quantity, unit, price, priceType, district, location, status, isApproved, imageUrls[], createdAt
- **`favourites`** — userId, listingId (doc ID = `{userId}_{listingId}` to dedupe cheaply)
- **`reports`** — reporterId, listingId, reason, description, status
- **`enquiries`** — buyerId, sellerId, listingId, message, status
- **`wanted_requests`** *(modeled, not built yet)* — buyerId, productName, categoryId, quantity, unit, district, location, maxPrice, priceType, neededBy, status

## Categories (seed data)

| name | slug | icon |
|---|---|---|
| Maize | maize | 🌽 |
| Beans | beans | 🫘 |
| Groundnuts | groundnuts | 🥜 |
| Rice | rice | 🍚 |
| Potatoes | potatoes | 🥔 |
| Tomatoes | tomatoes | 🍅 |
| Onions | onions | 🧅 |
| Poultry | poultry | 🐔 |
| Livestock | livestock | 🐄 |
| Other | other | 🌱 |

## Build order

1. ✅ Project shell — folder structure, design tokens, Firebase config, security rules
2. Visual shell & navigation (this step's HTML pages get their skeleton + bottom nav)
3. Authentication (register, login, logout)
4. Database wiring (categories seed, profile creation on register)
5. Listing creation (`sell.html`)
6. Marketplace browsing/search (`market.html`)
7. Listing details (`listing.html`)
8. Farmer dashboard
9. Buyer features (saved listings, enquiries)
10. Admin dashboard

## Future features (architecture allows for these, not built yet)

Wanted requests + matching engine, price intelligence, transport marketplace, in-app messaging, mobile money, escrow, ratings, AI listing assistance, SMS/push notifications, Chichewa language support, multi-district/country expansion.

## Marketplace disclaimer

Mlimi Market does not guarantee the outcome of any transaction. Buyers should inspect produce before paying. Users should verify quantities and prices directly with each other and report suspicious listings or users.
