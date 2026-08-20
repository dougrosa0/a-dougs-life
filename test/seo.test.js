const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { canonicalHost } = require('../src/middleware/canonical-host');

const PATHS = ['/', '/life', '/work', '/habits', '/books'];
const publicDir = path.join(__dirname, '..', 'src', 'public');

function handle(host, originalUrl = '/') {
  const req = { headers: { host }, originalUrl };
  const result = { redirect: null, passedThrough: false };
  const res = {
    redirect: (status, location) => {
      result.redirect = { status, location };
    },
  };

  canonicalHost()(req, res, () => {
    result.passedThrough = true;
  });

  return result;
}

test('www is redirected to the apex, keeping the path', () => {
  const result = handle('www.a-dougs-life.com', '/work');

  assert.deepEqual(result.redirect, {
    status: 301,
    location: 'https://a-dougs-life.com/work',
  });
  assert.equal(result.passedThrough, false);
});

test('the apex serves directly', () => {
  const result = handle('a-dougs-life.com', '/work');

  assert.equal(result.redirect, null);
  assert.equal(result.passedThrough, true);
});

// CI deploys a candidate revision to a tagged run.app URL and smoke-tests it
// before shifting traffic. Redirecting that host would fail every deploy.
test('the generated run.app host is never redirected', () => {
  for (const host of [
    'a-dougs-life-ot6sttcy7q-uc.a.run.app',
    'candidate-abc123---a-dougs-life-ot6sttcy7q-uc.a.run.app',
  ]) {
    const result = handle(host, '/');
    assert.equal(result.redirect, null, `${host} was redirected`);
    assert.equal(result.passedThrough, true, `${host} did not serve`);
  }
});

test('a missing or ported host does not throw', () => {
  assert.equal(handle(undefined, '/').passedThrough, true);
  assert.equal(handle('www.a-dougs-life.com:443', '/').redirect.status, 301);
});

test('the sitemap lists every page exactly once, on the canonical origin', () => {
  const xml = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  assert.deepEqual(
    locs,
    PATHS.map((p) => `https://a-dougs-life.com${p}`),
    'sitemap is out of step with the site pages',
  );
});

test('robots.txt allows crawling and points at the sitemap', () => {
  const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8');

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/a-dougs-life\.com\/sitemap\.xml$/m);
  // Disallowing the run.app copy would stop Google reading the canonical tag
  // on those pages, which is what actually consolidates the duplicates.
  assert.ok(!/^Disallow: \//m.test(robots), 'robots.txt blocks crawling');
});
