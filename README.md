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

## Recommended API documentation architecture

Status: proposal; automated contract generation and release synchronization
are not installed yet. The current site contains authored guides, not a complete
generated API reference.

Use the backend's public OpenAPI contract as the authoritative source for the API
reference. Keep conceptual guides and worked examples authored in this repository.
Do not maintain duplicate endpoint schemas or parameter tables in MDX.

### Current gaps

As checked on 2026-09-25, `https://api.browserbunny.dev/openapi.json` merges customer,
dashboard, and administrator routes. Its six `/v1` operations have no declared
OpenAPI authentication and empty successful-response schemas. Run creation also
returns HTTP 200 for an idempotent replay, while its schema only declares 202
and validation errors. The `Idempotency-Key` header is read manually and is not
represented in the schema.

The current public HTTP operations are:

| Method | Path |
| --- | --- |
| GET | `/v1/devices` |
| POST | `/v1/runs` |
| GET | `/v1/runs/{run_id}` |
| POST | `/v1/runs/{run_id}/cancel` |
| GET | `/v1/runs/{run_id}/logs` |
| GET | `/v1/runs/{run_id}/usage` |

Do not point Mintlify directly at the combined discovery document.

### Backend owns the contract

1. Mark customer-facing routes explicitly and export only that public surface.
   Initially this is the six `/v1` operations above. Exclude dashboard, session,
   billing-management, and administrator APIs unless deliberately made public.
   Remove unreferenced internal component schemas from the exported document too.
2. Add stable, intentional `operationId` values, tags, descriptions, request
   examples, and typed response models to the FastAPI route definitions. Preserve
   compatibility with actual response bodies when adding runtime validation.
3. Declare bearer API-key authentication using FastAPI security dependencies while
   retaining the existing key verification. Describe shared errors, pagination,
   rate-limit behavior, `Retry-After`, and idempotency. Declare both 202 for new
   runs and 200 for replays of a run-creation request.
4. Export a deterministic `openapi/public-v1.json` artifact from the backend build,
   without calling AWS, initializing browser execution, or requiring credentials.
   Include the API server `https://api.browserbunny.dev` and record the backend
   release version and source commit alongside the artifact.

### CI prevents drift

Backend CI should compare the set of public `(method, path)` pairs with the
exported OpenAPI operations. Every public operation must appear exactly once;
internal routes must not appear. Also validate the specification, unique operation
IDs, meaningful success/error schemas, auth requirements, headers, and examples.
Check representative mocked HTTP responses against their documented schemas and
require review for breaking changes. Test behavior for new runs, idempotent
replays/conflicts, unauthorized access, log pagination, and cancellation.

Generate the artifact from the same backend commit being released. After a
successful production deployment, a narrowly scoped GitHub App should copy that
exact artifact to this repository and open a docs update PR recording the backend
commit/version. For a gated release process, prepare and validate the docs update
before release, then publish it alongside or immediately after the API deployment.
Keep unreleased reference changes in preview. Do not fetch a mutable `main` schema
at docs build time or rely on periodic polling of a live endpoint.

Docs CI should verify the artifact's provenance/version, run `mint validate`, and
check broken links. The generated reference uses the artifact directly:

```json
{
  "navigation": {
    "tabs": [
      {
        "tab": "Guides",
        "groups": [
          { "group": "Get started", "pages": ["index", "quickstart"] }
        ]
      },
      {
        "tab": "API reference",
        "openapi": "openapi/public-v1.json"
      }
    ]
  }
}
```

Mintlify generates the endpoint pages, request parameters, response schemas, and
navigation. Keep descriptions close to the route/models in the backend. Use MDX
for tutorials, authentication guidance, lifecycle explanations, and SDK usage.
SDK convenience methods such as `run()` and `wait()` span multiple HTTP requests;
keep SDK method documentation separate from the one-operation-per-page HTTP
reference. Test guide snippets against the contract and the matching SDK release.

References:
- https://www.mintlify.com/docs/api-playground/openapi-setup
- https://fastapi.tiangolo.com/tutorial/response-model/
- https://fastapi.tiangolo.com/tutorial/security/first-steps/
