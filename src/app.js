const path = require('path');
const express = require('express');
const session = require('express-session');
const { createPublicRouter } = require('./routes/public');
const { createAuthRouter } = require('./routes/auth');
const { createAdminRouter } = require('./routes/admin');

function createApp({ bookStore, sessionSecret, secureCookies }) {
  const app = express();

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: Boolean(secureCookies),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(express.static(path.join(__dirname, 'public')));

  app.use(createPublicRouter(bookStore));
  app.use(createAuthRouter());
  app.use('/admin', createAdminRouter(bookStore));

  return app;
}

module.exports = { createApp };
