const { Pool } = require('pg');

function createDb(connectionString) {
  return new Pool({ connectionString });
}

function normalize(book) {
  return {
    title: book.title,
    author: book.author,
    status: book.status,
    category: book.category === '' || book.category === undefined ? 'fun' : book.category,
    rating: book.rating === '' || book.rating === undefined ? null : Number(book.rating),
    thoughts: book.thoughts || null,
    started_on: book.started_on || null,
    finished_on: book.finished_on || null,
  };
}

function createBookStore(pool) {
  return {
    async list() {
      const { rows } = await pool.query('SELECT * FROM books ORDER BY created_at DESC, id DESC');
      return rows;
    },
    async get(id) {
      const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
      return rows[0];
    },
    async create(book) {
      const b = normalize(book);
      const { rows } = await pool.query(
        `INSERT INTO books (title, author, status, category, rating, thoughts, started_on, finished_on)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [b.title, b.author, b.status, b.category, b.rating, b.thoughts, b.started_on, b.finished_on]
      );
      return rows[0];
    },
    async update(id, book) {
      const b = normalize(book);
      const { rows } = await pool.query(
        `UPDATE books SET
           title = $1,
           author = $2,
           status = $3,
           category = $4,
           rating = $5,
           thoughts = $6,
           started_on = $7,
           finished_on = $8
         WHERE id = $9
         RETURNING *`,
        [b.title, b.author, b.status, b.category, b.rating, b.thoughts, b.started_on, b.finished_on, id]
      );
      return rows[0];
    },
    async delete(id) {
      await pool.query('DELETE FROM books WHERE id = $1', [id]);
    },
  };
}

module.exports = { createDb, createBookStore };
