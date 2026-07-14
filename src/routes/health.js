const express = require('express');

function createHealthRouter(pool) {
  const router = express.Router();

  router.get('/healthz', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).send('ok');
    } catch (err) {
      res.status(503).send('unavailable');
    }
  });

  return router;
}

module.exports = { createHealthRouter };
