# dpd-sdk

Generates a versioned **OpenAPI 3.1 specification** for the [Speedy/DPD Web API](https://api.speedy.bg/api/docs/) directly from its published HTML documentation, and serves an interactive API reference from it.

The Speedy Web API ships only as an HTML reference page with no machine-readable schema and no version numbers. This project parses that documentation into a clean `openapi.yaml`, archives a copy each time the API changes, and publishes a browsable reference site — giving you a spec you can feed into client generators, mock servers, contract tests, and docs tooling.

## What it produces

| Artifact | Description |
| --- | --- |
| `openapi.yaml` | The latest generated OpenAPI 3.1 schema. |
| `versions/<YYYY-MM-DD>.yaml` | An archived schema for each API version. |
| `versions/index.json` | Manifest of all known versions, with `latest` and generation timestamps. |
| Scalar reference site | Interactive API docs deployed to GitHub Pages (see [`docs/index.html`](docs/index.html)). |

## How it works

```
Speedy HTML docs  ──▶  normalize ──▶  parse services + schemas ──▶  OpenAPI 3.1 document
(api.speedy.bg)         (cheerio)      (gen/generate.ts)              (openapi.yaml + versions/)

RSS changelog feed ──▶ latest change date ──▶ info.version  (gen/changelog.ts)
(services.speedy.bg)
```

- **`gen/generate.ts`** — fetches the docs HTML, normalizes it ([`gen/docs-normalizer.ts`](gen/docs-normalizer.ts)), and walks the document with [cheerio](https://cheerio.js.org/) to extract services/methods into `paths` and data structures into `components.schemas`.
- **`gen/changelog.ts`** — the Speedy API has no version numbers, so the version is derived from the most recent date in its [RSS changelog feed](https://services.speedy.bg/api/feed/) (`YYYY-MM-DD`).
- **`gen/release.ts`** — orchestrates a full release: builds the schema, writes `openapi.yaml`, archives `versions/<version>.yaml`, and upserts `versions/index.json`. Re-running for an unchanged feed produces no diff.

## Usage

Install dependencies (requires [Bun](https://bun.sh)):

```bash
bun install
```

Generate a release from the **live** docs and changelog feed:

```bash
bun run generate
```

Generate **offline** from the committed fixtures (deterministic — useful in CI and tests):

```bash
bun run generate:offline
```

Build a single schema from a local HTML file without touching the version manifest:

```bash
bun ./gen/generate.ts <input.html> [output.yaml]
```

### API reference site

Preview the Scalar reference locally:

```bash
bun run docs:preview
```

It is published to GitHub Pages on every push to `main` that changes `openapi.yaml` or the docs shell (see [`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml)).

## Tests

```bash
bun test
```

## Project layout

```
gen/
  generate.ts         # HTML docs → OpenAPI 3.1 document
  docs-normalizer.ts  # cleans up the raw docs HTML before parsing
  changelog.ts        # derives the version from the RSS changelog feed
  release.ts          # full versioned release pipeline
  *.test.ts           # tests
docs/index.html       # Scalar reference shell (loads openapi.yaml)
fixtures/             # committed docs HTML + feed for offline/deterministic builds
versions/             # archived per-version schemas + index.json manifest
openapi.yaml          # latest generated schema
```
