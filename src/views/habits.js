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
    detail: "No coffee until I've finished a 1-liter bottle of water.",
  },
  {
    name: 'Creative mornings',
    detail: "Do something creative before work; right now that's playing guitar.",
  },
  {
    name: 'Learn more about the world',
    detail:
      'Listen to <a href="https://www.wsj.com/podcasts/the-journal" rel="noopener">The Journal</a> Monday through Friday while I eat breakfast. It keeps me up to date on what is happening.',
  },
  {
    name: 'Exercise',
    detail: 'Move my body and spend a little time outside.',
  },
  {
    name: 'Daily journal',
    detail:
      "Hand-write a log of what I did that day; nothing about work allowed, and there should always be something meaningful to write.",
  },
  {
    name: 'Automate my savings',
    detail:
      'Paycheck direct-deposits to cover expenses; the rest auto-splits into a fixed amount to savings and the remainder into broad index funds. Long-term and hands-off.',
  },
  {
    name: 'Two to-do lists',
    detail:
      "One for work, one for personal. I run my priorities off these lists; without them the commitments pile up and I get anxious, so keeping them is how I stay focused and effective.",
  },
  {
    name: 'Read before bed',
    detail:
      "Read two books in parallel at all times: one fiction and one non-fiction.",
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

function habitsPage() {
  const goals = GOALS.map(goalItem).join('');
  const habits = HABITS.map((h) => `<li><b>${h.name}:</b> ${h.detail}</li>`).join('');

  const body = `
    <p>
      The goals I want to achieve in my life and some habits I keep to help get me there.
    </p>

    <h2>Goals</h2>
    <ul class="category-list">${goals}</ul>

    <h2>Habits</h2>
    <ul class="category-list">${habits}</ul>
  `;

  return layout({ title: 'Habits', body });
}

module.exports = { habitsPage };
