const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

// Seeded from my Kindle reading history (Amazon "Request My Data" export,
// August 2026): finish dates came from the completed-titles list, start dates
// from the reading-session log. Edit this array to change the page.
//
// `year` is the year the book was finished. Books still in progress have no
// finish date in the export, so they are placed by hand.
// Newest year first; within a year, the order they were read.
const BOOKS = [
  { year: '2026', category: 'learning', title: 'Never Split the Difference', author: 'Chris Voss, Tahl Raz' },
  { year: '2026', category: 'fun', title: 'Oathbringer', author: 'Brandon Sanderson' },
  { year: '2026', category: 'learning', title: 'Digital Minimalism', author: 'Cal Newport' },
  { year: '2025', category: 'fun', title: 'The Burgess Boys', author: 'Elizabeth Strout' },
  { year: '2025', category: 'fun', title: 'Anna Karenina', author: 'Leo Tolstoy' },
  { year: '2025', category: 'fun', title: 'Words of Radiance', author: 'Brandon Sanderson' },
  { year: '2025', category: 'learning', title: 'Awareness', author: 'Anthony de Mello' },
  { year: '2025', category: 'learning', title: 'What the Most Successful People Do Before Breakfast', author: 'Laura Vanderkam' },
  { year: '2025', category: 'learning', title: 'Meditations', author: 'Marcus Aurelius' },
  { year: '2025', category: 'learning', title: 'The Power of Positive Dog Training', author: 'Pat Miller' },
  { year: '2025', category: 'learning', title: 'U.S. Military\'s Dog Training Handbook', author: 'U.S. Department of Defense' },
  { year: '2024', category: 'learning', title: '12 Rules for Life', author: 'Jordan B. Peterson' },
  { year: '2024', category: 'learning', title: 'Start with Why', author: 'Simon Sinek' },
  { year: '2024', category: 'fun', title: 'The Way of Kings', author: 'Brandon Sanderson' },
  { year: '2024', category: 'learning', title: 'Japan: A Short History', author: 'Mikiso Hane' },
  { year: '2023', category: 'learning', title: 'In Defense of Food', author: 'Michael Pollan' },
  { year: '2023', category: 'fun', title: 'Animal Farm', author: 'George Orwell' },
  { year: '2023', category: 'learning', title: 'High Output Management', author: 'Andrew S. Grove' },
  { year: '2023', category: 'fun', title: 'The Candy House', author: 'Jennifer Egan' },
  { year: '2023', category: 'learning', title: 'How to Change Your Mind', author: 'Michael Pollan' },
  { year: '2020', category: 'fun', title: 'The Sojourn', author: 'Andrew Krivak' },
  { year: '2020', category: 'fun', title: 'A Man Called Ove', author: 'Fredrik Backman' },
  { year: '2020', category: 'learning', title: 'Atomic Habits', author: 'James Clear' },
  { year: '2019', category: 'learning', title: 'Principles', author: 'Ray Dalio' },
  { year: '2019', category: 'fun', title: 'Sleeping Beauties', author: 'Stephen King, Owen King' },
];

const COLUMNS = [
  { category: 'fun', label: 'For Fun' },
  { category: 'learning', label: 'For Learning' },
];

function renderBook(book) {
  return `<li>${escapeHtml(book.title)}<br><span class="byline">${escapeHtml(book.author)}</span></li>`;
}

// One shelf is a single year's books on one side of the spine. Empty shelves
// still render, because a year where I read no fiction is worth seeing.
// The label is redundant beside the column headings and only shows once the
// two columns stack on a narrow screen, where the headings are gone.
function renderShelf(books, label) {
  if (!books.length) return '<div class="shelf empty"></div>';
  return `<div class="shelf"><b class="shelf-label">${label}</b><ul>${books
    .map(renderBook)
    .join('')}</ul></div>`;
}

function booksPage() {
  const years = [...new Set(BOOKS.map((book) => book.year))];

  const rows = years
    .map((year) => {
      const inYear = BOOKS.filter((book) => book.year === year);
      const shelves = COLUMNS.map((col) =>
        renderShelf(inYear.filter((book) => book.category === col.category), col.label)
      ).join('');
      return `<li><i class="year">${year}</i>${shelves}</li>`;
    })
    .join('');

  const body = `
    <h2>Books I've Been Reading</h2>
    <p class="lede">
      What I have read since 2019, pulled from my Kindle history. Fiction on the
      left, everything else on the right.
    </p>

    <ul class="shelves">
      <li class="shelf-head">
        <i class="year"></i>
        ${COLUMNS.map((col) => `<div class="shelf"><b>${col.label}</b></div>`).join('')}
      </li>
      ${rows}
    </ul>
  `;

  return layout({ title: 'Books', body });
}

module.exports = { booksPage, BOOKS };
