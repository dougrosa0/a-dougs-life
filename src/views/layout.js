const GITHUB_URL = 'https://github.com/dougrosa0/a-dougs-life';

function layout({ title, body }) {
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
    <h1><a href="/">A Doug's Life</a></h1>
    <hr>
    <p class="simple-nav">
      <a href="/">Home</a>
      | <a href="/life">My Life</a>
      | <a href="/work">My Work</a>
      | <a href="/habits">My Habits</a>
      | <a href="/books">Books I've Been Reading</a>
    </p>
    <hr>
  </header>
  <main>
    ${body}
  </main>
  <footer>
    <hr>
    <p><small>Source code on <a href="${GITHUB_URL}" rel="noopener">GitHub</a>. Best viewed with any browser.</small></p>
  </footer>
</body>
</html>`;
}

module.exports = { layout, GITHUB_URL };
