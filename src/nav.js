// The pages this site has, in the order they appear in the nav.
//
// This module imports nothing on purpose. The layout needs the list to draw the
// nav, and the page registry needs it to attach renderers; if the list lived
// with the renderers, the layout would import the views that import the layout.
// Keeping it a leaf keeps that cycle from existing.
//
// Adding a page starts here, then add its renderer in pages.js. Nothing else
// needs editing: the routes, the nav, the sitemap check and the tests all read
// this list.
const NAV = [
  { path: '/', label: 'Home' },
  { path: '/life', label: 'My Life' },
  { path: '/work', label: 'My Work' },
  { path: '/habits', label: 'My Habits' },
  { path: '/books', label: "Books I've Been Reading" },
];

module.exports = { NAV };
