const express = require('express');
const { PAGES } = require('../pages');

// Every page comes from the registry, so a route can never be the thing that
// is missing when a page exists, or the thing left behind when one is removed.
function createPublicRouter() {
  const router = express.Router();

  for (const page of PAGES) {
    router.get(page.path, (req, res) => res.send(page.render()));
  }

  return router;
}

module.exports = { createPublicRouter };
