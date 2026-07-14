const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDb, createBookStore } = require('../src/db');

function freshStore() {
  const db = createDb(':memory:');
  return createBookStore(db);
}

test('create returns the persisted book with defaults normalized', () => {
  const store = freshStore();
  const book = store.create({ title: 'Deep Work', author: 'Cal Newport', status: 'want_to_read' });
  assert.equal(book.title, 'Deep Work');
  assert.equal(book.rating, null);
  assert.ok(book.id);
});

test('list returns books newest first', () => {
  const store = freshStore();
  store.create({ title: 'First', author: 'A', status: 'want_to_read' });
  store.create({ title: 'Second', author: 'B', status: 'want_to_read' });
  const titles = store.list().map((b) => b.title);
  assert.deepEqual(titles, ['Second', 'First']);
});

test('update overwrites fields', () => {
  const store = freshStore();
  const book = store.create({ title: 'Draft Title', author: 'A', status: 'reading' });
  const updated = store.update(book.id, {
    title: 'Final Title',
    author: 'A',
    status: 'finished',
    rating: '4',
  });
  assert.equal(updated.title, 'Final Title');
  assert.equal(updated.status, 'finished');
  assert.equal(updated.rating, 4);
});

test('delete removes the book', () => {
  const store = freshStore();
  const book = store.create({ title: 'Gone Soon', author: 'A', status: 'want_to_read' });
  store.delete(book.id);
  assert.equal(store.get(book.id), undefined);
});
