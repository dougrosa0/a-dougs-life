const express = require('express');
const { homePage } = require('../views/home');
const { booksPage } = require('../views/books');
const { asyncHandler } = require('../lib/async-handler');

function createPublicRouter(bookStore) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send(homePage({ isAdmin: Boolean(req.session && req.session.isAdmin) }));
  });

  router.get(
    '/books',
    asyncHandler(async (req, res) => {
      const books = await bookStore.list();
      res.send(booksPage({ books, isAdmin: Boolean(req.session && req.session.isAdmin) }));
    })
  );

  return router;
}

module.exports = { createPublicRouter };
