const CANONICAL_HOST = 'a-dougs-life.com';

// Sends www to the apex so the two custom domains do not compete as duplicates.
//
// The generated run.app host is deliberately left alone: CI deploys a candidate
// revision under a tagged run.app URL and smoke-tests it before shifting traffic,
// so redirecting that host would make every deploy fail its own health check.
function canonicalHost() {
  return (req, res, next) => {
    const host = (req.headers.host || '').toLowerCase().split(':')[0];

    if (host === `www.${CANONICAL_HOST}`) {
      res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
      return;
    }

    next();
  };
}

module.exports = { canonicalHost, CANONICAL_HOST };
