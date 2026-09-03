const { test } = require('node:test');
const assert = require('node:assert/strict');
const { homePage } = require('../src/views/home');
const { lifePage, ORDER, PHOTOS } = require('../src/views/life');
const { workPage } = require('../src/views/work');
const { habitsPage } = require('../src/views/habits');
const { booksPage, BOOKS } = require('../src/views/books');
const { notFoundPage, errorPage } = require('../src/views/errors');

const PAGES = [
  ['home', homePage],
  ['life', lifePage],
  ['work', workPage],
  ['habits', habitsPage],
  ['books', booksPage],
];

test('every page renders a complete document with the shared nav', () => {
  for (const [name, render] of PAGES) {
    const html = render();
    assert.match(html, /^<!DOCTYPE html>/, `${name} is missing a doctype`);
    assert.match(html, /<\/html>$/, `${name} is truncated`);
    for (const href of ['/', '/life', '/work', '/habits', '/books']) {
      assert.ok(html.includes(`href="${href}"`), `${name} nav is missing ${href}`);
    }
  }
});

test('no page links to the admin UI that no longer exists', () => {
  for (const [name, render] of PAGES) {
    const html = render();
    assert.ok(!html.includes('/admin'), `${name} still links to /admin`);
    assert.ok(!html.includes('/login'), `${name} still links to /login`);
  }
});

// The site's copy claims minimalism, so this is a content rule, not a style
// preference: em dashes were stripped site-wide and should stay gone.
test('no em dashes in rendered copy', () => {
  for (const [name, render] of PAGES) {
    assert.ok(!render().includes('—'), `${name} contains an em dash`);
  }
});

test('every photo on the life page links to its full-size copy', () => {
  const html = lifePage();
  const thumbs = [...html.matchAll(/\/photos\/thumb\/(photo-\d+\.jpg)/g)].map((m) => m[1]);
  assert.ok(thumbs.length > 0, 'no photos rendered');
  for (const name of thumbs) {
    assert.ok(html.includes(`href="/photos/full/${name}"`), `${name} has no full-size link`);
  }
});

// The whole page is photographs, so they are the content, not decoration.
// An empty alt would hand a screen reader a page with nothing on it.
test('every photo in the grid is described', () => {
  const html = lifePage();
  const alts = [...html.matchAll(/<img [^>]*alt="([^"]*)"/g)].map((m) => m[1]);

  assert.equal(alts.length, PHOTOS.length, 'an image rendered without an alt attribute');

  for (const photo of ORDER) {
    assert.ok(photo.alt, `${photo.file} has no description`);
    assert.ok(alts.includes(photo.alt), `${photo.file} did not render its description`);
  }
});

// These render in the site shell so a wrong turn still shows the nav, but they
// are not pages and must not tell a search engine otherwise.
test('error pages keep the shell and claim no canonical URL', () => {
  for (const [name, render] of [['not-found', notFoundPage], ['error', errorPage]]) {
    const html = render();
    assert.match(html, /^<!DOCTYPE html>/, `${name} is missing a doctype`);
    assert.ok(html.includes('href="/books"'), `${name} lost the nav`);
    assert.ok(!html.includes('rel="canonical"'), `${name} declares a canonical URL`);
    assert.ok(!html.includes('—'), `${name} contains an em dash`);
  }
});

test('books are grouped newest year first, with both shelves per year', () => {
  const html = booksPage();
  const years = [...html.matchAll(/<i class="year">(\d{4})<\/i>/g)].map((m) => m[1]);

  assert.deepEqual(years, [...years].sort().reverse(), 'years are not newest first');
  assert.deepEqual(years, [...new Set(years)], 'a year is repeated');
  assert.equal(years.length, new Set(BOOKS.map((b) => b.year)).size);

  // One shelf per category per year, plus the two column headings.
  const shelves = [...html.matchAll(/class="shelf(?: empty)?"/g)].length;
  assert.equal(shelves, years.length * 2 + 2);
});

test('every book has a title, an author, a year and a known category', () => {
  for (const book of BOOKS) {
    assert.ok(book.title, 'book is missing a title');
    assert.ok(book.author, `${book.title} is missing an author`);
    assert.match(book.year, /^\d{4}$/, `${book.title} has a bad year`);
    assert.ok(['fun', 'learning'].includes(book.category), `${book.title} has a bad category`);
  }
});

test('book titles and authors are escaped', () => {
  const html = booksPage();
  const apostrophed = BOOKS.find((b) => b.title.includes("'"));
  assert.ok(apostrophed, 'expected at least one title with an apostrophe');
  assert.ok(!html.includes(apostrophed.title), 'raw apostrophe leaked into the markup');
  assert.ok(html.includes(apostrophed.title.replace(/'/g, '&#39;')));
});

// Three hosts serve this site. The canonical tag is what tells search engines
// which one to index, so every page must carry one pointing at the apex.
test('every page declares its canonical URL on the apex', () => {
  const expected = {
    home: '/',
    life: '/life',
    work: '/work',
    habits: '/habits',
    books: '/books',
  };

  for (const [name, render] of PAGES) {
    const tag = `<link rel="canonical" href="https://a-dougs-life.com${expected[name]}">`;
    assert.ok(render().includes(tag), `${name} is missing ${tag}`);
  }
});
