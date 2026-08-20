const path = require('path');
const express = require('express');
const { canonicalHost } = require('./middleware/canonical-host');
const { createPublicRouter } = require('./routes/public');
const { createHealthRouter } = require('./routes/health');

function createApp() {
  const app = express();

  app.use(createHealthRouter());
  app.use(canonicalHost());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(createPublicRouter());

  return app;
}

module.exports = { createApp };
