# A Dougs Life

A small, personal, read-only website — an ode to *A Bug's Life* and to digital minimalism.
It shows a few things I'm into, starting with a list of books I've read. The whole
point of this project is the project itself: a working example of how little you
actually need to build and host something real.

Live philosophy: **four runtime dependencies, one file for a database, one container
image that runs identically anywhere.** No cloud-provider lock-in, no framework
sprawl, no build step.

## Stack

- [Express](https://expressjs.com/) — HTTP server & routing
- [express-session](https://www.npmjs.com/package/express-session) — cookie sessions (battle-tested, so auth cookies aren't hand-rolled)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) — the entire database is one file
- [dotenv](https://www.npmjs.com/package/dotenv) — loads `.env` for local dev

No template engine, no CSS framework, no ORM, no build step. HTML is generated with
plain JS template-literal view functions in `src/views/`; styling is a single
hand-written `src/public/style.css`. Passwords are hashed with Node's built-in
`crypto.scrypt` — no extra dependency needed for that either.

## Project layout

```
src/
  server.js       entrypoint
  app.js          express app wiring
  db.js           SQLite connection + schema
  auth.js         password hashing + session middleware
  routes/         public.js, auth.js, admin.js
  views/          template-literal HTML views
  public/         style.css, favicon
scripts/
  create-admin.js CLI to generate admin credentials
test/             node:test suite (no test framework dependency)
```

## Local development

```bash
npm install
cp .env.example .env
# fill in SESSION_SECRET (see the comment in .env.example for how to generate one)

npm run create-admin   # prompts for a password, prints ADMIN_PASSWORD_HASH/SALT
# paste those values into .env

npm run dev             # http://localhost:3000, restarts on file changes
```

Run the tests with:

```bash
npm test
```

## Deploying

The app is packaged as a single Docker image with no host-specific assumptions —
it runs the same on a VPS, a home server, or any PaaS that accepts a Dockerfile.

```bash
docker build -t a-dougs-life .
docker run -d \
  --name a-dougs-life \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  a-dougs-life
```

The SQLite file lives in the mounted `data/` volume, so it survives container
restarts and redeploys. There is no separate database service to provision.

Set real values for `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`,
and `ADMIN_PASSWORD_SALT` as environment variables on whatever host runs the
container — never commit real values in `.env`.

## Future ideas

Only books are supported today. An "about me" page, a projects/portfolio
section, and a lightweight "now" page are natural next additions once this
pattern (a table, an admin form, a public view) is proven out.

## License

[MIT](./LICENSE)
