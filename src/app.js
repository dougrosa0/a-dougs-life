const path = require('path');
const express = require('express');
const { canonicalHost } = require('./middleware/canonical-host');
const { securityHeaders } = require('./middleware/security-headers');
const { createPublicRouter } = require('./routes/public');
const { createHealthRouter } = require('./routes/health');
const { notFoundPage, errorPage } = require('./views/errors');

const PUBLIC_DIR = path.join(__dirname, 'public');

// Photos are large and change only when I re-run the optimiser, so they are
// worth caching hard. Not `immutable` though, and not for a year: the
// filenames are positional rather than content-addressed, so a re-crop reuses
// a name. A week is long enough to matter and short enough to recover.
const PHOTO_CACHE = { maxAge: '7d' };

// Everything else is small and more likely to be edited: the stylesheet, the
// favicon, robots.txt and the sitemap.
const ASSET_CACHE = { maxAge: '1h' };

function createApp() {
  const app = express();

  // Nothing is gained by telling the world which framework serves this.
  app.disable('x-powered-by');

  // First, so every response carries them: pages, redirects, static files and
  // the probe endpoint alike.
  app.use(securityHeaders());
  app.use(createHealthRouter());
  app.use(canonicalHost());
  app.use('/photos', express.static(path.join(PUBLIC_DIR, 'photos'), PHOTO_CACHE));
  app.use(express.static(PUBLIC_DIR, ASSET_CACHE));
  app.use(createPublicRouter());

  // Anything that reaches here matched no page and no file.
  app.use((req, res) => {
    res.status(404).send(notFoundPage());
  });

  // Express only recognises this as an error handler because it declares four
  // parameters, so `next` stays in the signature unused.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(errorPage());
  });

  return app;
}

module.exports = { createApp };
