const GITHUB_URL = 'https://github.com/dougrosa0/a-dougs-life';

function layout({ title, body, isAdmin = false }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title ? `${title} - A Doug's Life` : "A Doug's Life"}</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <div class="brand">
      <h1><a href="/">A Doug's Life</a></h1>
      <img class="brand-art" src="/the-giving-tree.jpg"
        alt="Line drawing of an old man sitting on a tree stump in the grass, captioned &quot;And the tree was happy.&quot;">
    </div>
    <hr>
    <p class="simple-nav">
      [ <a href="/">Home</a>
      | <a href="/books">Books</a>
      | <a href="/habits">Habits</a>
      | <a href="/work">My Work</a>
      ${
        isAdmin
          ? '| <a href="/admin">Admin</a> | <form action="/logout" method="post" class="inline-form"><button type="submit" class="link-button">Logout</button></form>'
          : ''
      } ]
    </p>
    <hr>
  </header>
  <main>
    ${body}
  </main>
  <footer>
    <hr>
    <p><small>Header illustration by Shel Silverstein, from <i>The Giving Tree</i> (1964).</small></p>
    <p><small>Source code on <a href="${GITHUB_URL}" rel="noopener">GitHub</a>. Best viewed with any browser.</small></p>
  </footer>
</body>
</html>`;
}

module.exports = { layout, GITHUB_URL };
