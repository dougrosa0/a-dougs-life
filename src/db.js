const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('want_to_read', 'reading', 'finished')),
    rating INTEGER CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
    thoughts TEXT,
    started_on TEXT,
    finished_on TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

function createDb(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

function createBookStore(db) {
  const insert = db.prepare(`
    INSERT INTO books (title, author, status, rating, thoughts, started_on, finished_on)
    VALUES (@title, @author, @status, @rating, @thoughts, @started_on, @finished_on)
  `);
  const update = db.prepare(`
    UPDATE books SET
      title = @title,
      author = @author,
      status = @status,
      rating = @rating,
      thoughts = @thoughts,
      started_on = @started_on,
      finished_on = @finished_on
    WHERE id = @id
  `);
  const remove = db.prepare('DELETE FROM books WHERE id = ?');
  const findById = db.prepare('SELECT * FROM books WHERE id = ?');
  const listAll = db.prepare('SELECT * FROM books ORDER BY created_at DESC, id DESC');

  const normalize = (book) => ({
    title: book.title,
    author: book.author,
    status: book.status,
    rating: book.rating === '' || book.rating === undefined ? null : Number(book.rating),
    thoughts: book.thoughts || null,
    started_on: book.started_on || null,
    finished_on: book.finished_on || null,
  });

  return {
    list() {
      return listAll.all();
    },
    get(id) {
      return findById.get(id);
    },
    create(book) {
      const info = insert.run(normalize(book));
      return findById.get(info.lastInsertRowid);
    },
    update(id, book) {
      update.run({ ...normalize(book), id });
      return findById.get(id);
    },
    delete(id) {
      remove.run(id);
    },
  };
}

module.exports = { createDb, createBookStore };
