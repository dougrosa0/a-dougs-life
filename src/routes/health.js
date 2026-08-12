const express = require('express');

function createHealthRouter() {
  const router = express.Router();

  // Nothing to check behind the app any more, so serving at all is the signal.
  // Cloud Run's probes reach this internally; the public URL cannot, because
  // the Google Front End answers /healthz itself before it reaches us.
  router.get('/healthz', (req, res) => {
    res.status(200).send('ok');
  });

  return router;
}

module.exports = { createHealthRouter };
