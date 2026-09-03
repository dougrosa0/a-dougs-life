const { NAV } = require('./nav');
const { homePage } = require('./views/home');
const { lifePage } = require('./views/life');
const { workPage } = require('./views/work');
const { habitsPage } = require('./views/habits');
const { booksPage } = require('./views/books');

// One renderer per path in NAV. Keyed rather than ordered so the two lists
// cannot drift apart silently.
const RENDERERS = {
  '/': homePage,
  '/life': lifePage,
  '/work': workPage,
  '/habits': habitsPage,
  '/books': booksPage,
};

// Fail at boot, not on the request that happens to hit the missing page.
for (const { path } of NAV) {
  if (typeof RENDERERS[path] !== 'function') {
    throw new Error(`No renderer for the page ${path} listed in nav.js`);
  }
}

for (const path of Object.keys(RENDERERS)) {
  if (!NAV.some((item) => item.path === path)) {
    throw new Error(`Renderer for ${path} has no entry in nav.js, so nothing serves it`);
  }
}

const PAGES = NAV.map((item) => ({ ...item, render: RENDERERS[item.path] }));

module.exports = { PAGES };
