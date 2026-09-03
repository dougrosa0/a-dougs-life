const { layout } = require('./layout');

// Both error pages render in the normal shell, so a wrong turn still leaves
// the nav on screen and a way back. Neither declares a canonical URL: these
// are not pages, and search engines should not be told they are.

function notFoundPage() {
  const body = `
    <h2>There is nothing here</h2>
    <p>
      That address does not match anything on this site. The
      <a href="/">home page</a> is a good place to start again.
    </p>
  `;

  return layout({ title: 'Not found', path: null, body });
}

function errorPage() {
  const body = `
    <h2>Something broke</h2>
    <p>
      That is on me, not on you. Try again in a moment, or head back to the
      <a href="/">home page</a>.
    </p>
  `;

  return layout({ title: 'Error', path: null, body });
}

module.exports = { notFoundPage, errorPage };
