/* ============================================================
   ICON LIBRARY
   ------------------------------------------------------------
   Small set of inline SVG line icons, used instead of emoji
   throughout the app. Emoji render inconsistently across Android
   phones and browsers and don't match the app's visual identity —
   these are plain stroke-based icons that inherit text color
   (stroke: currentColor) and scale cleanly at any size.

   Usage: icon("home") returns an <svg> string ready to drop into
   innerHTML, e.g. `<span>${icon("home")}</span>`.
   Load this file before nav.js and ui-helpers.js.
   ============================================================ */

const ICON_PATHS = {
  /* ---- Navigation ---- */
  home: `<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-6h3v6H17a1 1 0 0 0 1-1V10"/>`,
  market: `<path d="M6 9V6a6 6 0 0 1 12 0v3"/><path d="M4 9h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 9z"/>`,
  plus: `<path d="M12 5v14"/><path d="M5 12h14"/>`,
  heart: `<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>`,
  user: `<path d="M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21"/><circle cx="12" cy="7.5" r="4"/>`,

  /* ---- States ---- */
  sprout: `<path d="M12 21v-8"/><path d="M12 13c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6z"/><path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7z"/>`,
  alertTriangle: `<path d="M12 3.5 21 19H3L12 3.5z"/><path d="M12 10v4"/><path d="M12 17h.01"/>`,

  /* ---- Listing card / utility ---- */
  search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.3-4.3"/>`,
  mapPin: `<path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.2"/>`,
  clock: `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  badgeCheck: `<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.3 2.3 4.7-5.6"/>`,
  chevronRight: `<path d="M9 6l6 6-6 6"/>`,
  chevronLeft: `<path d="M15 6l-6 6 6 6"/>`,
  sliders: `<path d="M5 6h14"/><circle cx="9" cy="6" r="2"/><path d="M5 12h14"/><circle cx="15" cy="12" r="2"/><path d="M5 18h14"/><circle cx="9" cy="18" r="2"/>`,
  phone: `<path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5 5.6 1.5 1.5 0 0 1 6.5 4z"/>`,
  flag: `<path d="M6 21V4"/><path d="M6 4h11l-2.5 3.5L17 11H6"/>`,
  camera: `<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>`,
  x: `<path d="M6 6l12 12"/><path d="M18 6L6 18"/>`,

  /* ---- Produce categories (simplified line abstractions, not literal illustrations) ---- */
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
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
