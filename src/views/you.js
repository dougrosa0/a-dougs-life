const { layout, GITHUB_URL } = require('./layout');
const { escapeHtml } = require('./escape');

// The one page whose content is the request that asked for it. Every value on
// it came from a header, which means every value on it is attacker controlled:
// nothing reaches the HTML without going through escapeHtml first.

// Rows are [label, html]. `row` escapes its value and is what almost everything
// uses; `rawRow` does not, and exists for the one row that builds a link. A row
// with no value is dropped rather than left blank, so a browser that sent less
// gets a shorter table instead of a column of empty cells.
function row(label, value) {
  const empty = value === null || value === undefined || value === '';
  return [label, empty ? null : escapeHtml(value)];
}

function rawRow(label, html) {
  return [label, html];
}

function table(rows) {
  const cells = rows
    .filter(([, value]) => value !== null)
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${value}</td></tr>`)
    .join('');

  return `<table>${cells}</table>`;
}

// Chromium pads its brand list with a deliberately fake entry so that parsers
// assuming a fixed shape break early and visibly. Drop it.
const GREASE = /not[^a-z]*a[^a-z]*brand/i;

function browserFromHints(header) {
  if (!header) return null;

  const brands = [...header.matchAll(/"([^"]+)";\s*v="([^"]+)"/g)]
    .map(([, brand, version]) => ({ brand, version }))
    .filter(({ brand }) => !GREASE.test(brand));

  if (brands.length === 0) return null;

  // Every Chromium browser lists Chromium as well as itself, so the useful
  // name is whichever one is not that.
  const named = brands.find(({ brand }) => brand !== 'Chromium') ?? brands[0];
  return `${named.brand} ${named.version}`;
}

// Only reached for browsers that send no client hints at all, which today means
// Firefox and Safari. Edge and Opera come first because both of their user
// agent strings also contain the word Chrome.
const UA_BROWSERS = [
  [/Edg\/([\d.]+)/, 'Edge'],
  [/OPR\/([\d.]+)/, 'Opera'],
  [/Firefox\/([\d.]+)/, 'Firefox'],
  [/Chrome\/([\d.]+)/, 'Chrome'],
  [/Version\/([\d.]+).*Safari/, 'Safari'],
];

function browserFromUserAgent(ua) {
  if (!ua) return null;

  for (const [pattern, name] of UA_BROWSERS) {
    const match = ua.match(pattern);
    if (match) return `${name} ${match[1]}`;
  }

  return null;
}

// Names only. A user agent string cannot tell Windows 11 from Windows 10, and
// guessing is worse than saying less. Android before Linux and iOS before
// macOS, because each of those strings contains the other.
const UA_PLATFORMS = [
  [/Windows NT/, 'Windows'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Android/, 'Android'],
  [/CrOS/, 'Chrome OS'],
  [/Mac OS X/, 'macOS'],
  [/Linux/, 'Linux'],
];

function platform(hint, ua) {
  if (hint) return hint.replace(/"/g, '');
  if (!ua) return null;

  for (const [pattern, name] of UA_PLATFORMS) {
    if (pattern.test(ua)) return name;
  }

  return null;
}

// More than any real browser sends, and a cap on what a hand written header can
// make this page render.
const MAX_LANGUAGES = 10;

// Built once per container rather than once per request. The first call into
// ICU costs tens of milliseconds, which would otherwise land on whoever caused
// the cold start and be reported back to them as the time this page took.
let languageNames;
try {
  languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
  languageNames.of('en-US');
} catch {
  languageNames = null;
}

function languages(header) {
  if (!header) return null;

  const tags = header
    .split(',')
    .map((part) => part.split(';')[0].trim())
    .filter(Boolean)
    .slice(0, MAX_LANGUAGES);

  if (tags.length === 0) return null;

  const names = languageNames;

  return tags
    .map((tag) => {
      if (!names) return tag;
      try {
        // Throws on a malformed tag, and the tag came from a header.
        const name = names.of(tag);
        return name && name !== tag ? `${tag} (${name})` : tag;
      } catch {
        return tag;
      }
    })
    .join(', ');
}

const FETCH_SITE = {
  none: 'typed the address, or opened a bookmark',
  'same-origin': 'followed a link from this site',
  'same-site': 'followed a link from this site',
  'cross-site': 'followed a link from somewhere else',
};

function arrival(site, referer) {
  const how = site ? FETCH_SITE[site] ?? null : null;

  if (how && referer) return `${how}, from ${referer}`;
  if (how) return how;
  if (referer) return `followed a link from ${referer}`;
  return null;
}

function onWhenTrue(value) {
  return value ? 'on' : null;
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  return `${(seconds / 3600).toFixed(1)} hours`;
}

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function visitorTable(req) {
  const get = (name) => req.headers[name] || null;

  const ua = get('user-agent');
  const forwarded = get('x-forwarded-for');

  return table([
    // Cloud Run appends its own hop, so the client is the first entry.
    row('IP address', forwarded ? forwarded.split(',')[0].trim() : null),
    row('Browser', browserFromHints(get('sec-ch-ua')) ?? browserFromUserAgent(ua)),
    row('Operating system', platform(get('sec-ch-ua-platform'), ua)),
    row('Device', get('sec-ch-ua-mobile') === '?1' ? 'a phone or tablet' : null),
    row('Languages', languages(get('accept-language'))),
    row('Compression accepted', get('accept-encoding')),
    row('How you got here', arrival(get('sec-fetch-site'), get('referer'))),
    row('Do Not Track', onWhenTrue(get('dnt') === '1')),
    row('Global Privacy Control', onWhenTrue(get('sec-gpc') === '1')),
    row('Data saver', onWhenTrue(get('save-data') === 'on')),
    row('Address you asked for', get('host')),
  ]);
}

function serverTable(server) {
  // Three cases, and they are not the same thing: a known region, a container
  // on Cloud Run whose metadata lookup did not answer, and a laptop.
  let region = 'a laptop, this is not Cloud Run';
  if (server.region) {
    region = server.regionPlace ? `${server.region} (${server.regionPlace})` : server.region;
  } else if (server.service) {
    region = 'unknown, the metadata server did not answer';
  }

  const commit = server.gitSha
    ? rawRow(
        'Commit',
        `<a href="${GITHUB_URL}/commit/${escapeHtml(server.gitSha)}" rel="noopener">${escapeHtml(
          server.gitSha.slice(0, 8)
        )}</a>`
      )
    : rawRow('Commit', null);

  return table([
    row('Region', region),
    row('Service', server.service),
    row('Revision', server.revision),
    commit,
    row('Instance', server.instance ? `${server.instance.slice(0, 12)}...` : null),
    row('Container age', formatDuration(server.uptimeSeconds)),
    row(
      'Requests it has served',
      server.served === 1 ? 'one, this one, so you started it' : String(server.served)
    ),
    row('Memory in use', formatBytes(server.memoryBytes)),
    row('Runtime', `Node ${server.nodeVersion} on ${server.platform}`),
  ]);
}

function requestTable(req, builtMs) {
  const trace = req.headers['x-cloud-trace-context'] || null;

  return table([
    // The trace id is everything before the span id.
    row('Trace', trace ? trace.split('/')[0] : null),
    row('Built in', `${builtMs.toFixed(2)} ms`),
  ]);
}

function youPage(req, server) {
  const startedAt = process.hrtime.bigint();

  const visitor = visitorTable(req);
  const servedFrom = serverTable(server);
  const builtMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

  const body = `
    <h2>What your browser told me</h2>
    ${visitor}

    <h2>Where this was served from</h2>
    ${servedFrom}

    <h2>This request</h2>
    ${requestTable(req, builtMs)}
  `;

  return layout({ title: 'Runtime info', path: null, body });
}

module.exports = { youPage };
