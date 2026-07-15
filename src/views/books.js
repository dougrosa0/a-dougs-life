const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

const CATEGORY_ORDER = ['fun', 'learning'];
const CATEGORY_LABELS = {
  fun: 'For Fun',
  learning: 'For Learning',
};

const STATUS_ORDER = ['reading', 'want_to_read', 'finished'];
const STATUS_LABELS = {
  reading: 'Currently Reading',
  want_to_read: 'Want to Read',
  finished: 'Finished',
};

function renderBook(book) {
  const rating = book.rating ? ` (Rating: ${'*'.repeat(book.rating)}${'-'.repeat(5 - book.rating)})` : '';
  const thoughts = book.thoughts ? ` <span class="thoughts">"${escapeHtml(book.thoughts)}"</span>` : '';
  return `<li><b>${escapeHtml(book.title)}</b> by ${escapeHtml(book.author)}${rating}${thoughts}</li>`;
}

function renderStatusGroups(books) {
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    items: books.filter((book) => book.status === status),
  })).filter((group) => group.items.length > 0);

  if (!byStatus.length) {
    return '<p>Nothing here yet. Check back soon.</p>';
  }

  return `<ul class="category-list">${byStatus
    .map(
      (group) => `
        <li>
          <b>${group.label}</b> (${group.items.length})
          <ul class="sub-list">
            ${group.items.map(renderBook).join('')}
          </ul>
        </li>
      `
    )
    .join('')}</ul>`;
}

function booksPage({ books = [], isAdmin } = {}) {
  const sections = CATEGORY_ORDER.map(
    (category) => `
      <h3>${CATEGORY_LABELS[category]}</h3>
      ${renderStatusGroups(books.filter((book) => book.category === category))}
    `
  ).join('');

  const body = `
    <h2>Books</h2>
    ${sections}
  `;

  return layout({ title: 'Books', body, isAdmin });
}

module.exports = { booksPage };
