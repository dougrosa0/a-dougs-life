const { layout } = require('./layout');

function homePage() {
  const body = `
    <p>Hey, I'm Doug.</p>
    <p>
      This page is intentionally simple. I like to practice minimalism where I can, including in how
      I use technology and design. This website serves as a small record of what I'm into.
    </p>
  `;
  return layout({ title: undefined, body });
}

module.exports = { homePage };
