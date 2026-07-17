const { layout } = require('./layout');

// The overall goals I want to achieve in my life, through intention every day.
// A goal is either a plain string, or an object with `name` and a list of `parts`.
const GOALS = [
  'Make someone\'s day better',
  'Be kind to myself',
  {
    name: 'Be a great',
    parts: ['Son', 'Brother', 'Friend', 'Partner', 'Leader', 'Engineer', 'Father (one day)'],
  },
];

// Static list — edit these freely. `name` is the habit, `detail` is a short note.
const HABITS = [
  {
    name: 'Water before coffee',
    detail: "No coffee until I've finished a 1.5-liter bottle of water.",
  },
  {
    name: 'Creative mornings',
    detail: "Do something creative before work; right now that's playing guitar.",
  },
  {
    name: 'Exercise after work',
    detail: 'Yoga, running, or a bodyweight workout to close out the workday.',
  },
  {
    name: 'Daily journal',
    detail:
      "Hand-write a log of what I did that day; nothing about work allowed, so there's always something meaningful to write. If not, I make sure there are entries for coming days.",
  },
  {
    name: 'Investing',
    detail:
      'Paycheck direct-deposits to cover expenses; the rest auto-splits into a fixed amount to savings and the remainder into broad index funds. Long-term and hands-off.',
  },
  {
    name: 'Two to-do lists',
    detail:
      "One for work, one for personal. I run my priorities off these lists; without them the commitments pile up and I get anxious, so keeping them is how I stay focused and effective.",
  },
  {
    name: 'Call home on Sundays',
    detail: 'Call my parents every Sunday.',
  },
];

function goalItem(goal) {
  if (typeof goal === 'string') {
    return `<li>${goal}</li>`;
  }
  const parts = goal.parts.map((p) => `<li>${p}</li>`).join('');
  return `<li>${goal.name}:<ul class="sub-list">${parts}</ul></li>`;
}

function habitsPage({ isAdmin } = {}) {
  const goals = GOALS.map(goalItem).join('');
  const habits = HABITS.map((h) => `<li><b>${h.name}:</b> ${h.detail}</li>`).join('');

  const body = `
    <p>
      A few daily habits I keep; small rules that make sure I'm living with intention.
      Also, the overall goals I want to achieve in my life, through intention every day.
    </p>

    <h2>Goals</h2>
    <ul class="category-list">${goals}</ul>

    <h2>Habits</h2>
    <ul class="category-list">${habits}</ul>
  `;

  return layout({ title: 'Habits', body, isAdmin });
}

module.exports = { habitsPage };
