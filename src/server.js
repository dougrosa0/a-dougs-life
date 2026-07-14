require('dotenv').config();
const path = require('path');
const { createDb, createBookStore } = require('./db');
const { createApp } = require('./app');

const port = process.env.PORT || 3000;
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'a-dougs-life.sqlite');

const db = createDb(dbPath);
const bookStore = createBookStore(db);

const app = createApp({
  bookStore,
  sessionSecret: process.env.SESSION_SECRET,
  secureCookies: process.env.SECURE_COOKIES === 'true',
});

app.listen(port, () => {
  console.log(`A Dougs Life listening on port ${port}`);
});
