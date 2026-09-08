// Everything the container can say about itself.
//
// None of it needs configuring. Cloud Run injects K_SERVICE and K_REVISION into
// every container, and the metadata server answers for the region and the
// instance id, which is why infra/cloudrun.tf can go on setting no env vars.
// The one exception is GIT_SHA, which CI bakes in as a build arg.

// Cloud Run sets these. Off Cloud Run they are simply absent, and their absence
// is what tells the rest of this file it is running on a laptop.
const SERVICE = process.env.K_SERVICE || null;
const REVISION = process.env.K_REVISION || null;

// The Dockerfile defaults this to the literal 'unknown' so an image built by
// hand still runs; treat that as no answer rather than showing the word.
const GIT_SHA =
  process.env.GIT_SHA && process.env.GIT_SHA !== 'unknown' ? process.env.GIT_SHA : null;

const METADATA_ROOT = 'http://metadata.google.internal/computeMetadata/v1';

// Short on purpose. Nothing here is worth making a visitor wait for, and the
// answer is cached for the life of the container after the first success.
const METADATA_TIMEOUT_MS = 1000;

// A region id is accurate and tells almost nobody anything. The gloss is the
// part people actually read. Add a line when the service moves.
const REGION_PLACES = {
  'us-central1': 'Council Bluffs, Iowa',
};

// Requests this container has served, not counting Cloud Run's own probes.
// A visitor who sees 1 here is the reason the container exists.
let served = 0;

function countRequests() {
  return (req, res, next) => {
    if (req.path !== '/healthz') served += 1;
    next();
  };
}

async function metadataValue(pathname) {
  const res = await fetch(`${METADATA_ROOT}${pathname}`, {
    headers: { 'Metadata-Flavor': 'Google' },
    signal: AbortSignal.timeout(METADATA_TIMEOUT_MS),
  });

  if (!res.ok) return null;
  return (await res.text()).trim();
}

async function loadMetadata() {
  try {
    const [region, instance] = await Promise.all([
      metadataValue('/instance/region'),
      metadataValue('/instance/id'),
    ]);

    // The region comes back as projects/<number>/regions/us-central1.
    return { region: region ? region.split('/').pop() : null, instance };
  } catch {
    // A page about what the server knows is allowed to say it does not know.
    return { region: null, instance: null };
  }
}

let metadata = null;

function containerMetadata() {
  // metadata.google.internal does not resolve anywhere else, so off Cloud Run
  // this never opens a socket at all. That keeps `npm test`, `npm run dev` and
  // CI's local run of the image from waiting on a DNS failure.
  if (!SERVICE) return Promise.resolve({ region: null, instance: null });

  if (!metadata) metadata = loadMetadata();
  return metadata;
}

async function serverInfo() {
  const { region, instance } = await containerMetadata();

  return {
    service: SERVICE,
    revision: REVISION,
    gitSha: GIT_SHA,
    region,
    regionPlace: region ? REGION_PLACES[region] ?? null : null,
    instance,
    uptimeSeconds: process.uptime(),
    served,
    memoryBytes: process.memoryUsage().rss,
    nodeVersion: process.version,
    platform: `${process.platform}/${process.arch}`,
  };
}

module.exports = { serverInfo, countRequests };
