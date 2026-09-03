# A Doug's Life

A small, read-only personal website, live at **[a-dougs-life.com](https://a-dougs-life.com)**.
It is an ode to *A Bug's Life* and to digital minimalism: five pages about the things
I am into, with no account to create, nothing to subscribe to, and nothing tracking you.

The point of the project is the project itself. It is a working answer to the question
of how little you actually need to build something real and keep it running.

**Two runtime dependencies. No database. No build step. One container image that runs
the same anywhere.**

## The pages

| Path      | What it is                                              |
| --------- | ------------------------------------------------------- |
| `/`       | Who I am, in a paragraph                                |
| `/life`   | A photo grid, thumbnails linking to full-size copies    |
| `/work`   | A career timeline: what happened each year, and what I took from it |
| `/habits` | The daily habits I hold myself to, and the goals behind them |
| `/books`  | Everything I have read since 2019, split fun / learning |

## Stack

- **[Express](https://expressjs.com/)** for HTTP and routing
- **[dotenv](https://www.npmjs.com/package/dotenv)** to load `.env` in local development

No template engine, no CSS framework, no ORM, no bundler. HTML comes from plain
template-literal functions in `src/views/`. Styling is one hand-written stylesheet.

## Where the content lives

There is no database and no admin interface. Every page's content is a plain array in
the view that renders it, edited in a text editor and deployed by pushing:

```js
// src/views/books.js
const BOOKS = [
  { year: '2026', category: 'fun', title: 'Rhythm of War', author: 'Brandon Sanderson' },
  ...
];
```

`work.js`, `habits.js` and `life.js` follow the same shape. Each array has a comment
above it explaining how it is ordered and what editing it does, so changing the site
means changing one list.

## Project layout

```
src/
  server.js                entrypoint; reads PORT and listens
  app.js                   express wiring, in mount order
  middleware/
    canonical-host.js      sends www to the apex
  routes/
    public.js              the five pages
    health.js              /healthz, for Cloud Run's probes
  views/                   template-literal HTML, one file per page
    layout.js              the shared shell: head, nav, footer
    escape.js              HTML escaping helper
  public/                  style.css, favicon, robots.txt, sitemap.xml, photos/
test/                      node:test suite, no test framework dependency
infra/                     Terraform for the whole cloud footprint
.github/workflows/ci.yml   test, build, push, gated deploy
```

## Local development

```bash
npm install
npm run dev        # http://localhost:3000, restarts on file changes
```

There is nothing to configure. `.env` is optional and the only value it holds is
`PORT`; copy `.env.example` if you want to run on a different one.

Run the tests with:

```bash
npm test
```

The suite uses Node's built-in test runner, so there is no framework to install. It
covers the view functions, the canonical-host middleware, and the SEO files, and it
asserts a few decisions rather than just behaviour: that no page links to the admin
interface that was removed, that every page carries a canonical tag pointing at the
apex, and that no em dash survives into the copy.

## Deployment

The app is one Docker image with no host-specific assumptions. It runs the same on a
VPS, a home server, or any platform that accepts a Dockerfile:

```bash
docker build -t a-dougs-life .
docker run -d --name a-dougs-life -p 3000:3000 a-dougs-life
```

No volumes, no environment file, no database to provision. The container is the whole
application.

### What actually runs it

Google Cloud Run, in front of a custom domain, with the entire footprint described by
Terraform in [`infra/`](./infra). Pushing to `master` runs
[the pipeline](./.github/workflows/ci.yml):

1. **test** runs the unit suite.
2. **build** builds the image, starts it, and requests every page.
3. **push** publishes the image to Artifact Registry, tagged with the commit SHA.
4. **deploy** releases a candidate revision that receives **no traffic**, requests every
   page on its private tagged URL, and only then shifts traffic to it.

A failed smoke test at step 4 leaves the previous revision serving, so a broken build
cannot take the site down. GitHub authenticates to Google with Workload Identity
Federation, so there is no service account key stored anywhere.

## License

[MIT](./LICENSE)
