/* ============================================================
   UI HELPERS
   ------------------------------------------------------------
   Toasts, empty/error/loading state rendering, WhatsApp link
   construction, and client-side image compression. No
   dependencies — everything here is plain DOM/Canvas APIs.
   ============================================================ */

/* ---------- Toast ---------- */

function showToast(message, type = "info", duration = 3500) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : ""}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("is-leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, duration);
}

/* ---------- State block renderer ---------- */
/**
 * Renders a loading / empty / error state into a container.
 * Every important operation should show one of these so the
 * user is never left wondering what happened.
 *
 * Depends on icons.js being loaded first (uses icon()).
 */
function renderState(container, kind, opts = {}) {
  const templates = {
    loading: `<div class="state-block"><div class="spinner"></div></div>`,
    empty: `
      <div class="state-block">
        <div class="state-block__icon">${opts.icon || icon("sprout", 40)}</div>
        <div class="state-block__title">${opts.title || "Nothing here yet"}</div>
        <div>${opts.message || ""}</div>
      </div>`,
    error: `
      <div class="state-block">
        <div class="state-block__icon">${opts.icon || icon("alertTriangle", 40)}</div>
        <div class="state-block__title">${opts.title || "Something went wrong"}</div>
        <div>${opts.message || "Check your connection and try again."}</div>
        ${opts.retryLabel ? `<button class="btn btn-outline mt-4" id="stateRetryBtn" style="width:auto;display:inline-flex;padding:0 20px;">${opts.retryLabel}</button>` : ""}
      </div>`,
  };
  container.innerHTML = templates[kind] || "";
  if (kind === "error" && opts.onRetry) {
    const btn = container.querySelector("#stateRetryBtn");
    if (btn) btn.addEventListener("click", opts.onRetry);
  }
}

/* ---------- WhatsApp link ---------- */
/**
 * Builds a safe wa.me link with a pre-filled message.
 * Only call this with a phone number the seller has explicitly
 * chosen to make public (whatsappPublic === true on their
 * profile) — enforced by the calling page, not this function.
 */
function buildWhatsAppLink(phoneNumber, productName) {
  const digitsOnly = (phoneNumber || "").replace(/[^\d+]/g, "").replace(/^0/, "265"); // MW country code fallback for local format
  const message = `Hello, I found your ${productName} listing on Mlimi Market. Is it still available?`;
  return `https://wa.me/${digitsOnly.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

function buildCallLink(phoneNumber) {
  return `tel:${phoneNumber}`;
}

/* ---------- Image compression ---------- */
/**
 * Resizes and compresses an image file client-side before
 * upload, using canvas. Keeps upload time and hosting costs
 * down on slow connections.
 *
 * @param {File} file
 * @param {number} maxDimension - longest edge in px
 * @param {number} quality - JPEG quality 0-1
 * @returns {Promise<Blob>}
 */
function compressImage(file, maxDimension = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = () => reject(new Error("Could not read file"));

    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Could not load image"));

    reader.readAsDataURL(file);
  });
}

const MAX_IMAGES_PER_LISTING = 5;
const MAX_UPLOAD_FILE_SIZE_MB = 2; // pre-compression sanity cap, rejects absurdly large phone photos early

function validateImageFile(file) {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file.";
  }
  if (file.size > MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024) {
    return `Image is too large. Please choose a photo under ${MAX_UPLOAD_FILE_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * Uploads a compressed image to Cloudinary via an unsigned
 * upload preset (see cloudinary-config.js). No backend needed —
 * this is a plain POST straight from the browser.
 *
 * Depends on CLOUDINARY_CLOUD_NAME / CLOUDINARY_UPLOAD_PRESET
 * from cloudinary-config.js being loaded before this file.
 *
 * @param {Blob} blob - compressed image from compressImage()
 * @returns {Promise<string>} the hosted image URL to store on
 *   the listing document
 */
async function uploadListingImage(blob) {
  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    // Common cause: preset not set to "Unsigned", or file rejected
    // by the preset's format/size limits.
    throw new Error("Image upload failed. Please try again.");
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * NOTE on deleting images: unsigned uploads can't be deleted from
 * client-side code (deletion requires a signed request with the
 * API secret, which must never be exposed in the browser). When a
 * farmer deletes a listing, we remove the Firestore document and
 * stop referencing the image — the file itself stays on Cloudinary
 * until it's cleaned up some other way. At MVP scale this is a
 * non-issue (well under the free quota); worth revisiting only if
 * storage usage becomes a real concern later.
 */

/* ---------- Formatting ---------- */

function formatMoney(amount) {
  return `MK ${Number(amount).toLocaleString("en-US")}`;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function priceTypeLabel(priceType) {
  const labels = {
    per_kg: "per kg",
    per_bag: "per bag",
    per_tonne: "per tonne",
    total: "total",
  };
  return labels[priceType] || "";
}

/* ---------- Skeleton grid ---------- */
/**
 * Renders placeholder cards into a listing-grid while data loads.
 * Used instead of the generic spinner for content grids specifically —
 * it previews the shape of what's coming, which reads faster than a
 * bare spinner on a slow connection.
 */
function renderSkeletonGrid(container, count = 6) {
  const cards = Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-card__image"></div>
      <div class="skeleton-line" style="width:70%;"></div>
      <div class="skeleton-line" style="width:40%;margin-top:8px;"></div>
      <div class="skeleton-line" style="width:55%;margin-top:8px;"></div>
    </div>
  `).join("");
  container.innerHTML = `<div class="listing-grid">${cards}</div>`;
}

/* ---------- Listing card ---------- */
/**
 * Renders a single listing as the shared "market tag" card.
 * Depends on icon() (icons.js) and getCategoryBySlug() (categories.js)
 * being loaded first.
 *
 * @param {object} listing - a listing document (with .id from Firestore)
 * @param {object} [opts] - { extraClass, style } for optional stagger-in
 *   animation classes/inline delays. Safe to call as a bare Array.map
 *   callback too — a numeric index in this position is ignored.
 */
function listingCardHTML(listing, opts) {
  const options = opts && typeof opts === "object" ? opts : {};
  const category = getCategoryBySlug(listing.categorySlug);
  const image = listing.imageUrls && listing.imageUrls[0];
  const classAttr = `listing-card${options.extraClass ? ` ${options.extraClass}` : ""}`;
  const styleAttr = options.style ? ` style="${options.style}"` : "";

  const imageHTML = image
    ? `<img class="listing-card__image" src="${image}" alt="${listing.productName || "Produce"}" loading="lazy">`
    : `<div class="listing-card__image" style="display:flex;align-items:center;justify-content:center;color:var(--color-line);">${icon(category ? category.icon : "sprout", 32)}</div>`;

  const verifiedBadge = listing.sellerVerified
    ? `<span class="badge badge-verified" style="position:absolute;top:8px;right:8px;">${icon("badgeCheck", 12)}Verified</span>`
    : "";

  return `
    <a href="listing.html?id=${listing.id}" class="${classAttr}"${styleAttr}>
      <div style="position:relative;">
        ${imageHTML}
        ${verifiedBadge}
      </div>
      <div class="listing-card__body">
        <div class="listing-card__title">${listing.productName || "Untitled listing"}</div>
        <div class="price">${formatMoney(listing.price)} <span style="font-weight:500;color:var(--color-ink-soft);font-size:12px;">${priceTypeLabel(listing.priceType)}</span></div>
        <div class="listing-card__meta">
          <span class="meta-item">${icon("mapPin", 13)}${listing.district || ""}</span>
          <span class="meta-item">${listing.quantity != null ? listing.quantity : ""} ${listing.unit || ""}</span>
        </div>
      </div>
    </a>
  `;
}
