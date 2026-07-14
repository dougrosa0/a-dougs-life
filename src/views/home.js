const { layout } = require('./layout');

function homePage({ isAdmin } = {}) {
  const body = `
    <p>
      Hi, I'm Doug — a software engineering manager who still likes to keep his hands on the keyboard.
      This page is a small, open-source project: a record of things I'm into, starting with the
      <a href="/books">books I've been reading</a>.
    </p>
    <p>
      Thanks for stopping by. Sign my <s>guestbook</s>... okay, there's no guestbook. But feel free to
      look around.
    </p>
  `;
  return layout({ title: undefined, body, isAdmin });
}

module.exports = { homePage };
