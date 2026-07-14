const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

const STATUS_ORDER = ['reading', 'want_to_read', 'finished'];
const STATUS_LABELS = {
  reading: 'Currently Reading',
  want_to_read: 'Want to Read',
  finished: 'Finished',
};

function renderBook(book) {
  const rating = book.rating ? ` — Rating: ${'*'.repeat(book.rating)}${'-'.repeat(5 - book.rating)}` : '';
  const thoughts = book.thoughts ? ` <span class="thoughts">"${escapeHtml(book.thoughts)}"</span>` : '';
  return `<li><b>${escapeHtml(book.title)}</b> by ${escapeHtml(book.author)}${rating}${thoughts}</li>`;
}

function booksPage({ books, isAdmin } = {}) {
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    items: books.filter((book) => book.status === status),
  })).filter((group) => group.items.length > 0);

  const content = byStatus.length
    ? `<ul class="category-list">${byStatus
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
        .join('')}</ul>`
    : '<p>No books yet — check back soon.</p>';

  const body = `
    <h2>Books</h2>
    ${content}
  `;

  return layout({ title: 'Books', body, isAdmin });
}

module.exports = { booksPage };
