# BrowserBunny documentation

Live site: https://browserbunny.dev/docs

Public guides, setup instructions, examples, and OpenAPI servers document only
the production API at `https://api.browserbunny.dev`.

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

The backend owns the seven public operations and their request/response schemas.
`dash/agent/openapi.py` exports the registered routes and runtime response models.
The export includes paths, query parameters, request models, and response models.
Backend tests validate real service responses against it.

The public production snapshot is served at
`https://api.browserbunny.dev/openapi/public-v1.json`. This excludes dashboard and
administrator APIs. Do not use the combined `/openapi.json` document.

Endpoint MDX files select exactly one operation from `openapi/public-v1.json`;
Mintlify renders its parameters and responses directly. Guides explain the same
contract with equivalent cURL, Python, and JavaScript examples, without duplicating
endpoint schemas. Use matching `cURL`, `Python`, and `JavaScript` labels in
`CodeGroup`, `RequestExample`, and `Tabs` components so selections synchronize.
Keep prose and headings language-neutral; put client-specific setup and behavior
inside the matching tab on `client-setup/humans.mdx`. JSON response examples stay shared.

Structure guides for mobile scanning: use task headings, numbered steps for
workflows, labeled bullets for independent rules, and narrow tables for field or
status definitions. Separate active and terminal statuses. Keep detailed client
methods in an accordion and next actions in linked cards or a short list. Avoid
paragraphs that combine status enums, field definitions, and unrelated caveats.
Keep reference-page parameters and responses generated from OpenAPI.

Keep the native Copy Page action enabled first in `contextual.options` and set
`contextual.display` to `header`. It applies to every guide and endpoint page.
The shared stylesheet gives this control a visible accent and 44px touch target;
retain Mintlify's native Markdown copying and success feedback.

## Setup paths

`client-setup.mdx` offers two paths: `client-setup/agents.mdx` for the authenticated
test MCP and `client-setup/humans.mdx` for direct API clients. The test endpoint is
`https://api.browserbunny.dev/v1/mcp` and uses the same project API keys as REST.
It exposes seven tools, with input/output schemas derived from the live HTTP
contract. MCP create submissions require `idempotency_key` for safe retries.
Verify discovery and a real tool call before changing connection guidance.

Mintlify's `https://browserbunny.dev/docs/mcp` remains an optional documentation
search server. Its page-menu shortcuts connect to documentation, not test tools.
Never send project API keys to the public documentation MCP.

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

`api-release.json` records the backend bundle and generated schema for this
revision. Publish only after the matching production deployment and a successful
`check-api` comparison. Local verification uses the backend exporter with
`--check`, `mint validate`, and `mint broken-links`.
