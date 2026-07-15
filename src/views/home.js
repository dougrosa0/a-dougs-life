const { layout } = require('./layout');

function homePage({ isAdmin } = {}) {
  const body = `
    <p>
      Hi, I'm Doug. An avid learner, interested in the intersection of technology and business.
      Lover of the outdoors: skiing, surfing, camping, hiking, you name it. Also a washed-up soccer
      player who still enjoys adult leagues.
    </p>
    <p>
      This page is intentionally simple. I like to practice minimalism where I can, including in how
      I use technology and design. It's a small record of what I'm into; the
      <a href="/books">books I've been reading</a> and the <a href="/habits">habits</a> I lean on.
    </p>
  `;
  return layout({ title: undefined, body, isAdmin });
}

module.exports = { homePage };
