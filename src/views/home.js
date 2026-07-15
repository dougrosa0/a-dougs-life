const { layout } = require('./layout');

function homePage({ isAdmin } = {}) {
  const body = `
    <p>
      Hi, I'm Doug — an avid learner, interested in the intersection of technology and business.
      Lover of the outdoors: skiing, surfing, camping, hiking, you name it. Also a washed-up soccer
      player who still enjoys adult leagues.
    </p>
    <p>
      This page is a small, open-source project: a record of things I'm into — the
      <a href="/books">books I've been reading</a> and the <a href="/habits">habits</a> I lean on.
      Thanks for stopping by; feel free to look around.
    </p>
  `;
  return layout({ title: undefined, body, isAdmin });
}

module.exports = { homePage };
