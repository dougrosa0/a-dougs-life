const { layout } = require('./layout');

function lifePage({ isAdmin } = {}) {
  const body = `
    <h2>My Life: a 14,000 ft view</h2>
    <p>TBD.</p>
  `;

  return layout({ title: 'My Life', body, isAdmin });
}

module.exports = { lifePage };
