# BrowserBunny documentation

Live site: https://browserbunny.dev/docs

Mintlify publishes this repository's `main` branch. The marketing Vercel project
proxies `/docs` and the Mintlify asset/API routes to
`https://browser-bunny.mintlify.site`. Documentation changes do not require a
marketing deployment.

## Local development

```sh
mint validate
mint broken-links
mint dev --no-open
```

The site uses the application's dark appearance and primary accent `#EA8DFF`
(`rgb(234, 141, 255)`). The source of the brand values is
`client/ui/src/styles.css` in the sibling client repository. `docs.json` owns
Mintlify's colors, background, and navigation. `styles.css` supplies the system
font stack, component surfaces, borders, and focus states. The favicon and
wordmark reuse the marketing site's browser/checkmark icon. Keep these values
and assets in sync with the application when the brand changes.

## Public API reference

The backend owns the six public operations and all request/response schemas in
`dash/agent/openapi.py`. It derives paths, query parameters, and request models
from the registered runtime routes. Exporting fails if an operation is missing
from the contract. Backend tests validate real service responses against it.

The public production snapshot is served at
`https://api.browserbunny.dev/openapi/public-v1.json`. This excludes dashboard and
administrator APIs. Do not use the combined `/openapi.json` document.

Endpoint MDX files select exactly one operation from `openapi/public-v1.json`;
Mintlify renders its parameters and responses directly. Guides explain the same
contract and the Python SDK, without duplicating endpoint schemas.

## Release workflow

1. In the backend checkout, run the backend and SDK tests, then generate:
   `python scripts/export_public_openapi.py ../docs/openapi/public-v1.json`.
2. Update the authored guides for behavior changes. Run `mint validate` and
   `mint broken-links` in this repository.
3. Deploy the matching backend artifact to production. Record its bundle SHA-256,
   SDK version, and schema SHA-256 in `api-release.json`.
4. Run `node scripts/check-api.mjs`. It checks release provenance and compares
   this committed specification with the deployed public contract.
5. Commit and push this repository's `main` branch. Mintlify publishes it
   automatically. Verify both the Mintlify origin and `browserbunny.dev/docs`.

The GitHub workflow repeats contract, Mintlify, and link validation on changes.
A workflow-dispatch run can check drift after a backend release. Deploy the backend
before merging its corresponding docs update, so the production comparison passes.

This is a coordinated release check; backend changes do not automatically commit
or publish documentation. Keep the checked-in schema immutable between reviewed
updates and regenerate it rather than editing JSON by hand.
