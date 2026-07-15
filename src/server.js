require('dotenv').config();
const { createDb, createBookStore } = require('./db');
const { createApp } = require('./app');

const port = process.env.PORT || 3000;

const pool = createDb(process.env.DATABASE_URL);
const bookStore = createBookStore(pool);

const app = createApp({
  bookStore,
  pool,
  sessionSecret: process.env.SESSION_SECRET,
  secureCookies: process.env.SECURE_COOKIES === 'true',
});

app.listen(port, () => {
  console.log(`A Doug's Life listening on port ${port}`);
});
