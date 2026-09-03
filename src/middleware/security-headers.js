// The site is five pages of server-rendered HTML with one stylesheet, one
// favicon and a directory of photos. There is no JavaScript, no form, no
// third-party asset and no inline style anywhere in it, so the policy can deny
// every resource type by default and only allow back the two that are used.
// If a future page needs a script, this is the file that has to say so.
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "img-src 'self'",
  "style-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

// A year, and it applies to www as well as the apex. Deliberately no preload
// directive: that submits the domain to a browser-vendor list and is painful
// to undo.
const STRICT_TRANSPORT_SECURITY = 'max-age=31536000; includeSubDomains';

function securityHeaders() {
  return (req, res, next) => {
    res.set({
      'Content-Security-Policy': CONTENT_SECURITY_POLICY,
      'Strict-Transport-Security': STRICT_TRANSPORT_SECURITY,
      'X-Content-Type-Options': 'nosniff',
      // The site claims to track nobody. Sending no referrer when someone
      // follows the GitHub link in the footer is part of meaning it.
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    });

    next();
  };
}

module.exports = { securityHeaders, CONTENT_SECURITY_POLICY };
