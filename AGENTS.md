# BrowserBunny documentation

This Mintlify site documents the production public API and Python SDK. Its source
is this repository; `main` publishes to https://browserbunny.dev/docs.

- Use active voice, second person, concise sentences, and sentence-case headings.
- Use only `start_url`, `instructions`, and `devices` for HTTP submissions.
  Describe only the supported API; do not add compatibility aliases or old fields.
- `devices` is a list of supported names from GET /v1/devices; each uses the latest AWS browser release.
- Upload URLs and supported conditions belong in instructions.
- Device-discovery examples use default transport settings; do not add timeout arguments, curl max-time flags, or abort signals.
- Request deduplication keys are internal SDK transport details, not public setup steps or API-reference parameters.
- The SDK sends the same selectors as HTTP. Describe one test with
  one execution per environment, and one status field for both progress and result.
- The backend owns OpenAPI. Regenerate `openapi/public-v1.json` using
  `../backend/scripts/export_public_openapi.py`; never hand-edit generated schemas.
- Endpoint pages must reference the checked-in OpenAPI operation. Keep guides
  accurate about enabled targets, conditions, limits, results, and billing.
- Run `mint validate`, `mint broken-links`, and `node scripts/check-api.mjs` before
  publishing. See README.md for release order and artifact provenance.
- Preserve the existing branding, domain proxy configuration, and dark appearance.
- Publish using the explicit `/Users/denniswarfield/.ssh/browser_bunny_id` SSH key
  with `IdentitiesOnly=yes`; verify the browser-bunny identity and use fast-forward
  updates. Never switch the ambient GitHub account or commit credentials.
