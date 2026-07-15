const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

const STATUSES = [
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
];

const CATEGORIES = [
  { value: 'fun', label: 'For Fun' },
  { value: 'learning', label: 'For Learning' },
];

function option(value, label, selected) {
  return `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`;
}

function adminBookFormPage({ book = {}, isNew = true, error } = {}) {
  const action = isNew ? '/admin/books' : `/admin/books/${book.id}`;
  const ratingOptions = ['', 1, 2, 3, 4, 5]
    .map((value) => option(value, value === '' ? 'None' : `${value}`, String(book.rating ?? '')))
    .join('');

  const body = `
    <h1>${isNew ? 'Add a Book' : 'Edit Book'}</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form action="${action}" method="post" class="stacked-form">
      <label for="title">Title</label>
      <input type="text" id="title" name="title" value="${escapeHtml(book.title)}" required>

      <label for="author">Author</label>
      <input type="text" id="author" name="author" value="${escapeHtml(book.author)}" required>

      <label for="status">Status</label>
      <select id="status" name="status">
        ${STATUSES.map((s) => option(s.value, s.label, book.status || 'want_to_read')).join('')}
      </select>

      <label for="category">Category</label>
      <select id="category" name="category">
        ${CATEGORIES.map((c) => option(c.value, c.label, book.category || 'fun')).join('')}
      </select>

      <label for="rating">Rating</label>
      <select id="rating" name="rating">
        ${ratingOptions}
      </select>

      <label for="started_on">Started</label>
      <input type="date" id="started_on" name="started_on" value="${escapeHtml(book.started_on)}">

      <label for="finished_on">Finished</label>
      <input type="date" id="finished_on" name="finished_on" value="${escapeHtml(book.finished_on)}">

      <label for="thoughts">Thoughts</label>
      <textarea id="thoughts" name="thoughts" rows="4">${escapeHtml(book.thoughts)}</textarea>

      <button type="submit">${isNew ? 'Add Book' : 'Save Changes'}</button>
    </form>
  `;
  return layout({ title: isNew ? 'Add a Book' : 'Edit Book', body, isAdmin: true });
}

module.exports = { adminBookFormPage };
