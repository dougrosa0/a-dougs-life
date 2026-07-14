const express = require('express');
const { verifyPassword } = require('../auth');
const { loginPage } = require('../views/login');

function createAuthRouter() {
  const router = express.Router();

  router.get('/login', (req, res) => {
    if (req.session && req.session.isAdmin) {
      return res.redirect('/admin');
    }
    res.send(loginPage());
  });

  router.post('/login', express.urlencoded({ extended: false }), (req, res) => {
    const { username, password } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME;
    const salt = process.env.ADMIN_PASSWORD_SALT;
    const hash = process.env.ADMIN_PASSWORD_HASH;

    const usernameMatches = typeof username === 'string' && username === expectedUsername;
    const passwordMatches = typeof password === 'string' && verifyPassword(password, salt, hash);

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).send(loginPage({ error: 'Invalid username or password.' }));
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).send(loginPage({ error: 'Something went wrong. Try again.' }));
      }
      req.session.isAdmin = true;
      res.redirect('/admin');
    });
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  return router;
}

module.exports = { createAuthRouter };
