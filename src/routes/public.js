const express = require('express');
const { homePage } = require('../views/home');
const { booksPage } = require('../views/books');
const { habitsPage } = require('../views/habits');
const { workPage } = require('../views/work');
const { lifePage } = require('../views/life');

function createPublicRouter() {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send(homePage({ isAdmin: Boolean(req.session && req.session.isAdmin) }));
  });

  router.get('/life', (req, res) => {
    res.send(lifePage({ isAdmin: Boolean(req.session && req.session.isAdmin) }));
  });

  router.get('/habits', (req, res) => {
    res.send(habitsPage({ isAdmin: Boolean(req.session && req.session.isAdmin) }));
  });

  router.get('/work', (req, res) => {
    res.send(workPage({ isAdmin: Boolean(req.session && req.session.isAdmin) }));
  });

  router.get('/books', (req, res) => {
    res.send(booksPage({ isAdmin: Boolean(req.session && req.session.isAdmin) }));
  });

  return router;
}

module.exports = { createPublicRouter };
