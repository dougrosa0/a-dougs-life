const path = require('node:path');
const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const migrate = require('node-pg-migrate');
const { createDb, createBookStore } = require('../src/db');

const runner = migrate.default || migrate.runner || migrate;

const pool = createDb(process.env.TEST_DATABASE_URL);
const store = createBookStore(pool);

before(async () => {
  await runner({
    databaseUrl: process.env.TEST_DATABASE_URL,
    dir: path.join(__dirname, '..', 'migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    log: () => {},
  });
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE books RESTART IDENTITY CASCADE');
});

after(async () => {
  await pool.end();
});

test('create returns the persisted book with defaults normalized', async () => {
  const book = await store.create({ title: 'Deep Work', author: 'Cal Newport', status: 'want_to_read' });
  assert.equal(book.title, 'Deep Work');
  assert.equal(book.rating, null);
  assert.ok(book.id);
});

test('list returns books newest first', async () => {
  await store.create({ title: 'First', author: 'A', status: 'want_to_read' });
  await store.create({ title: 'Second', author: 'B', status: 'want_to_read' });
  const titles = (await store.list()).map((b) => b.title);
  assert.deepEqual(titles, ['Second', 'First']);
});

test('update overwrites fields', async () => {
  const book = await store.create({ title: 'Draft Title', author: 'A', status: 'reading' });
  const updated = await store.update(book.id, {
    title: 'Final Title',
    author: 'A',
    status: 'finished',
    rating: '4',
  });
  assert.equal(updated.title, 'Final Title');
  assert.equal(updated.status, 'finished');
  assert.equal(updated.rating, 4);
});

test('delete removes the book', async () => {
  const book = await store.create({ title: 'Gone Soon', author: 'A', status: 'want_to_read' });
  await store.delete(book.id);
  assert.equal(await store.get(book.id), undefined);
});
