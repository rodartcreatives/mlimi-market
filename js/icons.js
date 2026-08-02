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
  home: `<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-6h3v6H17a1 1 0 0 0 1-1V10"/>`,
  market: `<path d="M6 9V6a6 6 0 0 1 12 0v3"/><path d="M4 9h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 9z"/>`,
  plus: `<path d="M12 5v14"/><path d="M5 12h14"/>`,
  heart: `<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>`,
  user: `<path d="M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21"/><circle cx="12" cy="7.5" r="4"/>`,
  sprout: `<path d="M12 21v-8"/><path d="M12 13c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6z"/><path d="M12 13c0-4 3-7 7-7 0 4-3 7-7 7z"/>`,
  alertTriangle: `<path d="M12 3.5 21 19H3L12 3.5z"/><path d="M12 10v4"/><path d="M12 17h.01"/>`,
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
