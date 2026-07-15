const express = require('express');
const { requireAdmin } = require('../auth');
const { adminDashboardPage } = require('../views/admin-dashboard');
const { adminBookFormPage } = require('../views/admin-book-form');
const { asyncHandler } = require('../lib/async-handler');

const VALID_STATUSES = new Set(['want_to_read', 'reading', 'finished']);
const VALID_CATEGORIES = new Set(['fun', 'learning']);

function validateBook(body) {
  if (!body.title || !body.title.trim()) return 'Title is required.';
  if (!body.author || !body.author.trim()) return 'Author is required.';
  if (!VALID_STATUSES.has(body.status)) return 'Invalid status.';
  if (!VALID_CATEGORIES.has(body.category)) return 'Invalid category.';
  if (body.rating && !['1', '2', '3', '4', '5', ''].includes(body.rating)) return 'Invalid rating.';
  return null;
}

function createAdminRouter(bookStore) {
  const router = express.Router();
  router.use(requireAdmin);
  router.use(express.urlencoded({ extended: false }));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.send(adminDashboardPage({ books: await bookStore.list() }));
    })
  );

  router.get('/books/new', (req, res) => {
    res.send(adminBookFormPage({ isNew: true }));
  });

  router.post(
    '/books',
    asyncHandler(async (req, res) => {
      const error = validateBook(req.body);
      if (error) {
        return res.status(400).send(adminBookFormPage({ book: req.body, isNew: true, error }));
      }
      await bookStore.create(req.body);
      res.redirect('/admin');
    })
  );

  router.get(
    '/books/:id/edit',
    asyncHandler(async (req, res) => {
      const book = await bookStore.get(req.params.id);
      if (!book) return res.status(404).send('Book not found');
      res.send(adminBookFormPage({ book, isNew: false }));
    })
  );

  router.post(
    '/books/:id',
    asyncHandler(async (req, res) => {
      const existing = await bookStore.get(req.params.id);
      if (!existing) return res.status(404).send('Book not found');
      const error = validateBook(req.body);
      if (error) {
        return res
          .status(400)
          .send(adminBookFormPage({ book: { ...req.body, id: req.params.id }, isNew: false, error }));
      }
      await bookStore.update(req.params.id, req.body);
      res.redirect('/admin');
    })
  );

  router.post(
    '/books/:id/delete',
    asyncHandler(async (req, res) => {
      await bookStore.delete(req.params.id);
      res.redirect('/admin');
    })
  );

  return router;
}

module.exports = { createAdminRouter };
