const path = require('path');
const express = require('express');
const { createPublicRouter } = require('./routes/public');
const { createHealthRouter } = require('./routes/health');

function createApp() {
  const app = express();

  app.use(createHealthRouter());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(createPublicRouter());

  return app;
}

module.exports = { createApp };
