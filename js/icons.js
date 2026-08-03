/* ============================================================
   ICON LIBRARY
   ------------------------------------------------------------
   General-purpose icons here are Lucide (ISC licensed) paths,
   dropped in directly rather than pulled from a CDN — keeps the
   app dependency-free and working offline/no-build. Produce
   category icons (maize, beans, etc.) stay custom since Lucide
   has no farm-produce set; they're drawn at the same stroke
   weight so they sit consistently next to the Lucide icons.

   Usage: icon("home") returns an <svg> string ready to drop into
   innerHTML, e.g. `<span>${icon("home")}</span>`.
   Load this file before nav.js and ui-helpers.js.
   ============================================================ */

const ICON_PATHS = {
  /* ---- Navigation (Lucide: house, shopping-bag, plus, heart, user) ---- */
  home: `<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
  market: `<path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>`,
  plus: `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  heart: `<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>`,
  user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,

  /* ---- States (Lucide: sprout, triangle-alert) ---- */
  sprout: `<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/><path d="M5 21h14"/>`,
  alertTriangle: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,

  /* ---- Listing card / utility (Lucide) ---- */
  search: `<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>`,
  mapPin: `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
  badgeCheck: `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>`,
  chevronRight: `<path d="m9 18 6-6-6-6"/>`,
  chevronLeft: `<path d="m15 18-6-6 6-6"/>`,
  sliders: `<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>`,
  phone: `<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>`,
  flag: `<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>`,
  camera: `<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>`,
  x: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,

  /* ---- Auth screens (Lucide: eye, eye-off) ---- */
  eye: `<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>`,
  eyeOff: `<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>`,

  /* ---- Produce categories (custom — no Lucide equivalent exists) ---- */
  maize: `<ellipse cx="12" cy="11" rx="4" ry="7"/><path d="M9 7h6M9 11h6M9 15h6"/><path d="M8 18c-2 1-3 3-3 3s2-1 4-1"/>`,
  beans: `<path d="M8 15c-2-3-1-8 3-9 3-.8 6 1 6 4 0 2-1 3-3 4-3 1.2-4.5 3.5-4 6 .3 1.7-1 2-2 1z"/>`,
  groundnuts: `<path d="M9 6c-2 0-3.5 1.6-3.5 3.5 0 1 .4 1.8 1 2.5-.6.7-1 1.5-1 2.5C5.5 16.4 7 18 9 18c1.6 0 2.8-.9 3.3-2.2.5 1.3 1.7 2.2 3.3 2.2 2 0 3.5-1.6 3.5-3.5 0-1-.4-1.8-1-2.5.6-.7 1-1.5 1-2.5C19 7.6 17.5 6 15.5 6c-1.6 0-2.8.9-3.3 2.2C11.7 6.9 10.5 6 9 6z"/>`,
  rice: `<path d="M4 13c0 4 3.6 7 8 7s8-3 8-7"/><path d="M4 13h16"/><path d="M9 9l.5-2M12 8V6M15 9l-.5-2"/>`,
  potatoes: `<path d="M7 14c-1.5-1.7-1.2-4.5.5-6C9 6.7 10.7 6 12.5 6.3c2 .3 3.7 1.7 4.2 3.6.5 1.8-.1 3.6-1.5 4.8-1.6 1.4-2 3-1.7 4.6.2 1.2-.7 2-1.8 1.7-2.6-.7-4.3-1.6-4.7-3.5-.2-1.1 0-2.3 0-3.1z"/><circle cx="10.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/><circle cx="13.5" cy="13" r=".5" fill="currentColor" stroke="none"/>`,
  tomatoes: `<circle cx="12" cy="13" r="6.5"/><path d="M12 6.5V4M9.5 6l-1-1.8M14.5 6l1-1.8"/>`,
  onions: `<path d="M12 5c3 2 4.5 5 4.5 8a4.5 4.5 0 0 1-9 0c0-3 1.5-6 4.5-8z"/><path d="M12 5V2.5M10.5 19l-1 2M13.5 19l1 2"/>`,
  poultry: `<circle cx="15" cy="8" r="2.2"/><path d="M15 5.5c.5-1 1.8-1 2 0"/><path d="M7 17c0-4 3.5-8 8-8s5 3 5 5-2 3-4 3H9c-1 0-2 .5-2 2z"/><path d="M10 19v2M14 19v2"/>`,
  livestock: `<path d="M8 10c-1.5 0-2.5-1.2-2-2.6C6.4 6 7.7 5.3 9 6c.6-1.2 2-2 3-2s2.4.8 3 2c1.3-.7 2.6 0 3 1.4.5 1.4-.5 2.6-2 2.6"/><path d="M7 10c0 4 2 7 5 7s5-3 5-7"/><circle cx="9.5" cy="12.5" r=".5" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12.5" r=".5" fill="currentColor" stroke="none"/>`,
};

/**
 * Returns an inline SVG string for the named icon.
 * size: pixel width/height (icons are square).
 */
function icon(name, size = 22) {
  const paths = ICON_PATHS[name];
  if (!paths) {
    console.warn(`Unknown icon: ${name}`);
    return "";
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
