/* ============================================================
   CLOUDINARY CONFIG
   ------------------------------------------------------------
   Used for produce photo hosting instead of Firebase Storage
   (which now requires the card-gated Blaze plan).

   Both values below are meant to be visible in client code —
   this is how unsigned client-side uploads work. Treat the
   preset name with a *little* more care than the cloud name
   (don't post it somewhere unrelated to this app), since anyone
   who has it can upload to your account within the preset's
   configured limits. Those limits are what actually protect
   you — see the setup notes below.

   SETUP (do this in the Cloudinary dashboard, no card required):
   1. Sign up free at https://cloudinary.com
   2. Your "Cloud name" is shown on the dashboard home — paste below.
   3. Go to Settings (gear icon) → Upload → Upload presets → Add upload preset
   4. Set "Signing Mode" to Unsigned
   5. Under that preset's settings, restrict it:
        - Allowed formats: jpg, png, webp
        - Max file size: ~2MB (our client-side compression already
          targets well under this, but the preset is the real
          enforcement point — the browser check can be bypassed,
          the preset limit cannot)
        - Folder: mlimi-market/listings (keeps uploads organized)
   6. Save the preset, copy its name into CLOUDINARY_UPLOAD_PRESET below
   ============================================================ */

const CLOUDINARY_CLOUD_NAME = "1x0fogrt";
const CLOUDINARY_UPLOAD_PRESET = "mlimi_market_listings";

