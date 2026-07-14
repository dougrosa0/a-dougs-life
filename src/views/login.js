const { layout } = require('./layout');
const { escapeHtml } = require('./escape');

function loginPage({ error } = {}) {
  const body = `
    <h1>Login</h1>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <form action="/login" method="post" class="stacked-form">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" autocomplete="username" required>

      <label for="password">Password</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required>

      <button type="submit">Log in</button>
    </form>
  `;
  return layout({ title: 'Login', body });
}

module.exports = { loginPage };
