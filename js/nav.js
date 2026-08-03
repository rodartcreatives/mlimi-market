/* ============================================================
   BOTTOM NAVIGATION
   ------------------------------------------------------------
   Injects the shared bottom nav bar into any page that includes
   this script and calls renderBottomNav("home" | "market" |
   "sell" | "saved" | "profile").

   Depends on icons.js being loaded first (uses icon()).
   ============================================================ */

function renderBottomNav(activePage) {
  const items = [
    { key: "home", href: "index.html", iconName: "home", label: "Home" },
    { key: "market", href: "market.html", iconName: "market", label: "Market" },
    { key: "sell", href: "sell.html", iconName: "plus", label: "Sell", isSell: true },
    { key: "saved", href: "dashboard-buyer.html", iconName: "heart", label: "Saved" },
    { key: "profile", href: "profile.html", iconName: "user", label: "Profile" },
  ];

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Main navigation");

  nav.innerHTML = items.map((item) => `
    <a href="${item.href}"
      class="bottom-nav__item ${item.isSell ? "is-sell" : ""} ${activePage === item.key ? "is-active" : ""}"
      aria-current="${activePage === item.key ? "page" : "false"}"
    >
      <span class="bottom-nav__icon">${icon(item.iconName, item.isSell ? 20 : 22)}</span>
      <span>${item.label}</span>
    </a>
  `).join("");

  document.body.appendChild(nav);
}
