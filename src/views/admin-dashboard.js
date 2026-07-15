const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

const STATUS_LABELS = {
  reading: 'Currently Reading',
  want_to_read: 'Want to Read',
  finished: 'Finished',
};

const CATEGORY_LABELS = {
  fun: 'For Fun',
  learning: 'For Learning',
};

function renderRow(book) {
  return `
    <tr>
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td>${STATUS_LABELS[book.status] || book.status}</td>
      <td>${CATEGORY_LABELS[book.category] || book.category}</td>
      <td class="admin-actions">
        <a href="/admin/books/${book.id}/edit">Edit</a>
        <form action="/admin/books/${book.id}/delete" method="post" onsubmit="return confirm('Delete this book?');">
          <button type="submit" class="link-button">Delete</button>
        </form>
      </td>
    </tr>
  `;
}

function adminDashboardPage({ books }) {
  const rows = books.length
    ? books.map(renderRow).join('')
    : '<tr><td colspan="5">No books yet.</td></tr>';

  const body = `
    <h1>Admin</h1>
    <p><a href="/admin/books/new">+ Add a book</a></p>
    <table>
      <thead>
        <tr><th>Title</th><th>Author</th><th>Status</th><th>Category</th><th></th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
  return layout({ title: 'Admin', body, isAdmin: true });
}

module.exports = { adminDashboardPage };
