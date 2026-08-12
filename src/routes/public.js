const express = require('express');
const { homePage } = require('../views/home');
const { booksPage } = require('../views/books');
const { habitsPage } = require('../views/habits');
const { workPage } = require('../views/work');
const { lifePage } = require('../views/life');

function createPublicRouter() {
  const router = express.Router();

  router.get('/', (req, res) => res.send(homePage()));
  router.get('/life', (req, res) => res.send(lifePage()));
  router.get('/habits', (req, res) => res.send(habitsPage()));
  router.get('/work', (req, res) => res.send(workPage()));
  router.get('/books', (req, res) => res.send(booksPage()));

  return router;
}

module.exports = { createPublicRouter };
