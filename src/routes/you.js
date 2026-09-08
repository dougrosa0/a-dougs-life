const express = require('express');
const { serverInfo } = require('../server-info');
const { youPage } = require('../views/you');

// Kept out of the page registry on purpose. Every page in `pages.js` is pure,
// renders the same bytes for everyone and appears in the nav and the sitemap;
// this one is none of those things, and the registry throws at boot for a
// renderer with no nav entry. So it gets its own router, the way /healthz does.
function createYouRouter() {
  const router = express.Router();

  // Express 4 does not catch a rejected promise from a handler, so the await
  // needs its own try and an explicit hand off to the error middleware.
  router.get('/you', async (req, res, next) => {
    try {
      const server = await serverInfo();

      res.set({
        // No two responses are alike, so nothing between here and the browser
        // is allowed to keep one and hand it to somebody else.
        'Cache-Control': 'no-store',
        // The footer links this from every page, so a crawler will find it.
        // A page that reads differently on every request is not worth indexing,
        // and it declares no canonical URL for the same reason.
        'X-Robots-Tag': 'noindex',
      });

      res.send(youPage(req, server));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createYouRouter };
