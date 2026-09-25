import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

const specFile = new URL('../openapi/public-v1.json', import.meta.url);
const raw = await readFile(specFile, 'utf8');
const local = JSON.parse(raw);
const release = JSON.parse(await readFile(new URL('../api-release.json', import.meta.url), 'utf8'));
const digest = createHash('sha256').update(raw).digest('hex');
if (release.openapi_sha256 !== digest || !/^[a-f0-9]{64}$/.test(release.backend_bundle_sha256)) {
  throw new Error('API release provenance does not match the checked-in schema.');
}
const response = await fetch('https://api.browserbunny.dev/openapi/public-v1.json', {
  signal: AbortSignal.timeout(30_000), headers: { 'Cache-Control': 'no-cache' },
});
if (!response.ok) throw new Error(`Production contract returned HTTP ${response.status}.`);
const remote = await response.json();
if (!isDeepStrictEqual(local, remote)) {
  throw new Error('Documentation differs from the deployed API. Regenerate and deploy the matching contract.');
}
const methods = new Set(['get', 'post', 'put', 'patch', 'delete']);
let count = 0;
for (const [path, item] of Object.entries(local.paths)) {
  if (!path.startsWith('/v1/')) throw new Error('An internal route entered the public specification.');
  count += Object.keys(item).filter(key => methods.has(key)).length;
}
console.log(`Production and documentation match: ${count} operations; SDK ${release.sdk_version}; schema ${digest.slice(0, 12)}.`);
