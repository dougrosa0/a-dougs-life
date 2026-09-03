const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { PAGES } = require('../src/pages');
const { PHOTOS } = require('../src/views/life');

// These exercise the assembled app rather than the view functions: the routers,
// the static mounts, the header middleware and the order they are wired in.
// Everything else in the suite would still pass if app.js were empty.

let server;
let port;

before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  port = server.address().port;
});

after(() => {
  server.closeAllConnections?.();
  server.close();
});

// A hand-rolled client rather than fetch, because setting the Host header is
// the whole point of the redirect tests and fetch will not allow it.
function request(path, { host } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path, headers: host ? { Host: host } : {} },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('every page in the registry is served, and serves what it renders', async () => {
  for (const page of PAGES) {
    const res = await request(page.path);

    assert.equal(res.status, 200, `${page.path} did not answer 200`);
    assert.match(res.headers['content-type'], /^text\/html/, `${page.path} is not HTML`);
    assert.equal(res.body, page.render(), `${page.path} served something other than its view`);
  }
});

test('a path that is not a page gets the site 404, not a bare Express one', async () => {
  const res = await request('/no-such-page');

  assert.equal(res.status, 404);
  assert.match(res.body, /^<!DOCTYPE html>/);
  assert.ok(res.body.includes('href="/books"'), 'the 404 lost the nav');
});

test('the health endpoint answers for Cloud Run probes', async () => {
  const res = await request('/healthz');

  assert.equal(res.status, 200);
  assert.equal(res.body, 'ok');
});

// Mount order is deliberate and was previously pinned by nothing: the health
// router sits ahead of the redirect so a probe on any host is answered rather
// than bounced to the apex.
test('a probe is answered on any host, never redirected', async () => {
  const res = await request('/healthz', { host: 'www.a-dougs-life.com' });

  assert.equal(res.status, 200);
  assert.equal(res.body, 'ok');
});

test('www is redirected to the apex, keeping the path', async () => {
  const res = await request('/work', { host: 'www.a-dougs-life.com' });

  assert.equal(res.status, 301);
  assert.equal(res.headers.location, 'https://a-dougs-life.com/work');
});

test('the apex and the generated run.app host both serve directly', async () => {
  for (const host of ['a-dougs-life.com', 'a-dougs-life-ot6sttcy7q-uc.a.run.app']) {
    const res = await request('/', { host });
    assert.equal(res.status, 200, `${host} did not serve`);
  }
});

test('security headers are on every kind of response', async () => {
  const responses = [
    ['a page', await request('/')],
    ['a stylesheet', await request('/style.css')],
    ['a 404', await request('/no-such-page')],
    ['a redirect', await request('/', { host: 'www.a-dougs-life.com' })],
  ];

  for (const [what, res] of responses) {
    assert.match(
      res.headers['content-security-policy'] ?? '',
      /default-src 'none'/,
      `${what} has no content security policy`
    );
    assert.equal(res.headers['x-content-type-options'], 'nosniff', `${what} allows sniffing`);
    assert.equal(res.headers['referrer-policy'], 'no-referrer', `${what} leaks a referrer`);
    assert.ok(res.headers['strict-transport-security'], `${what} has no HSTS`);
    assert.equal(res.headers['x-powered-by'], undefined, `${what} announces Express`);
  }
});

test('static assets are cached, photos for longer than the rest', async () => {
  const css = await request('/style.css');
  assert.equal(css.status, 200);
  assert.equal(css.headers['cache-control'], 'public, max-age=3600');

  const photo = await request(`/photos/thumb/${PHOTOS[0].file}`);
  assert.equal(photo.status, 200);
  assert.equal(photo.headers['cache-control'], 'public, max-age=604800');
});

test('every photo the page links to is actually served', async () => {
  for (const { file } of PHOTOS) {
    const thumb = await request(`/photos/thumb/${file}`);
    const full = await request(`/photos/full/${file}`);

    assert.equal(thumb.status, 200, `no thumbnail for ${file}`);
    assert.equal(full.status, 200, `no full-size copy for ${file}`);
  }
});
