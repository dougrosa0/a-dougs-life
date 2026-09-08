const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { serverInfo } = require('../src/server-info');

// /you is the only page built out of the request rather than out of an array,
// so it is the only one the registry-wide tests in views.test.js cannot reach.
// Everything they assert for the other five is asserted here for this one, plus
// the two things unique to it: that headers come back escaped, and that nothing
// waits on a metadata server that does not exist off Cloud Run.

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

// Same hand-rolled client as app.test.js, widened to send arbitrary headers,
// which is the whole point of most of these tests.
function request(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, headers }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('/you answers with a complete HTML document', async () => {
  const res = await request('/you');

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /^text\/html/);
  assert.match(res.body, /^<!DOCTYPE html>/);
  assert.ok(res.body.trimEnd().endsWith('</html>'));
});

test('/you is never cached and never indexed', async () => {
  const res = await request('/you');

  assert.equal(res.headers['cache-control'], 'no-store');
  assert.equal(res.headers['x-robots-tag'], 'noindex');
});

// It declares no canonical URL for the same reason it is not in the sitemap:
// it is not one page, it is a different page every time.
test('/you keeps the shared nav and declares no canonical URL', async () => {
  const res = await request('/you');

  assert.ok(res.body.includes('href="/books"'), '/you lost the nav');
  assert.ok(!res.body.includes('rel="canonical"'), '/you should not claim a canonical URL');
});

test('no em dashes in rendered copy', async () => {
  const res = await request('/you');

  assert.ok(!res.body.includes('—'), '/you contains an em dash');
});

// Node's client sends a Host header and nothing else, which is a fair stand-in
// for a browser that volunteers very little. Every row should drop out rather
// than render blank, and nothing should throw.
test('/you renders when the request carries almost no headers', async () => {
  const res = await request('/you');

  assert.equal(res.status, 200);
  assert.ok(!res.body.includes('<td></td>'), 'an absent header rendered as an empty row');
});

test('/you reports back what the request actually said', async () => {
  const res = await request('/you', {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/131.0',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'Accept-Encoding': 'br, gzip',
    'X-Forwarded-For': '203.0.113.7, 130.211.0.1',
  });

  assert.ok(res.body.includes('Firefox 131.0'), 'did not name the browser');
  assert.ok(res.body.includes('Linux'), 'did not name the operating system');
  assert.ok(res.body.includes('fr-FR'), 'did not list the language');
  assert.ok(res.body.includes('br, gzip'), 'did not list the encodings');

  // Cloud Run appends its own address; only the first entry is the visitor.
  assert.ok(res.body.includes('203.0.113.7'), 'did not report the client address');
  assert.ok(!res.body.includes('130.211.0.1'), 'reported the proxy hop as the client');
});

// The CSP would stop this executing, but the CSP is the second line of defence.
test('a header full of markup comes back escaped', async () => {
  const payload = '<script>alert(1)</script>';
  const res = await request('/you', {
    'Accept-Encoding': payload,
    'X-Forwarded-For': payload,
  });

  assert.equal(res.status, 200);
  assert.ok(!res.body.includes(payload), 'a header was reflected as live markup');
  assert.ok(res.body.includes('&lt;script&gt;'), 'the header was dropped rather than escaped');
});

test('the footer links to it from an ordinary page', async () => {
  const res = await request('/');

  assert.ok(res.body.includes('href="/you"'), 'nothing on the site links to /you');
});

// The guard that matters most: metadata.google.internal resolves only on Cloud
// Run, and CI runs this image locally and curls /you. Without the K_SERVICE
// check this would sit on a DNS failure on every request.
test('server info resolves immediately and without a network call off Cloud Run', async () => {
  assert.equal(process.env.K_SERVICE, undefined, 'this test assumes it is not on Cloud Run');

  const startedAt = Date.now();
  const info = await serverInfo();
  const elapsed = Date.now() - startedAt;

  assert.equal(info.region, null);
  assert.equal(info.instance, null);
  assert.equal(info.service, null);
  assert.ok(typeof info.uptimeSeconds === 'number');
  assert.ok(elapsed < 100, `serverInfo took ${elapsed}ms, so something went to the network`);
});
