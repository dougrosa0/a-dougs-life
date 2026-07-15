const { layout } = require('./layout');

// Static list — edit these freely. `name` is the habit, `detail` is a short note.
const HABITS = [
  {
    name: 'Water before coffee',
    detail: "No coffee until I've finished a 1.5-liter bottle of water.",
  },
  {
    name: 'Creative mornings',
    detail: "Do something creative before work — right now that's playing guitar.",
  },
  {
    name: 'Exercise after work',
    detail: 'Yoga, running, or a bodyweight workout to close out the workday.',
  },
  {
    name: 'Daily journal',
    detail:
      "Hand-write a log of what I did that day — nothing about work allowed, so there's always something meaningful to write.",
  },
  {
    name: 'Automate savings',
    detail:
      'Paycheck direct-deposits to cover expenses; the rest auto-splits — a fixed amount to savings, the remainder into broad index funds. Long-term and hands-off.',
  },
  {
    name: 'Call home on Sundays',
    detail: 'Call my parents every Sunday.',
  },
];

function habitsPage({ isAdmin } = {}) {
  const items = HABITS.map((h) => `<li><b>${h.name}</b> — ${h.detail}</li>`).join('');

  const body = `
    <h2>Habits</h2>
    <p>A few daily habits I keep — small rules that make sure every day has something meaningful in it.</p>
    <ul class="category-list">${items}</ul>
  `;

  return layout({ title: 'Habits', body, isAdmin });
}

module.exports = { habitsPage };
