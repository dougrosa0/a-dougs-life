const { layout } = require('./layout');

// Static list — edit these freely. `name` is the habit, `detail` is a short note.
// These are placeholders to get you started; swap in your real habits.
const HABITS = [
  { name: 'Morning reading', detail: 'A little non-fiction with coffee before the day gets loud.' },
  { name: 'Time-blocking', detail: 'Plan the day in blocks so deep work actually gets a slot.' },
  { name: 'Get outside daily', detail: 'A walk, a run, or a ski lap — moving beats sitting.' },
  { name: 'Weekly review', detail: 'Sunday reset: look back at the week, line up the next one.' },
  { name: 'Strength training', detail: 'A few lifting sessions a week to keep the washed-up athlete going.' },
];

function habitsPage({ isAdmin } = {}) {
  const items = HABITS.map(
    (h) => `<li><b>${h.name}</b> — ${h.detail}</li>`
  ).join('');

  const body = `
    <h2>Habits</h2>
    <p>A few habits and routines I try to keep.</p>
    <ul class="category-list">${items}</ul>
  `;

  return layout({ title: 'Habits', body, isAdmin });
}

module.exports = { habitsPage };
