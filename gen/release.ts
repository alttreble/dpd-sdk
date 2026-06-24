import { join } from 'path';
import { stringify as stringifyYaml } from 'yaml';
import { ConsoleLogger, type Logger } from '../logger';
import {
  APIGenerator,
  FetchDocsProvider,
  FileDocsProvider,
  type DocsProvider,
} from './generate';
import {
  FetchChangelogProvider,
  FileChangelogProvider,
  type ChangelogProvider,
} from './changelog';

type ManifestEntry = {
  version: string;
  file: string;
  generatedAt: string;
};

type Manifest = {
  latest: string;
  versions: ManifestEntry[];
};

export interface ReleaseOptions {
  docsProvider: DocsProvider;
  changelogProvider: ChangelogProvider;
  /** Repository root the artifacts are written relative to. Defaults to the cwd. */
  outDir?: string;
  logger?: Logger;
}

export interface ReleaseResult {
  version: string;
  versionFile: string;
  latestFile: string;
}

/**
 * Produces a versioned OpenAPI release:
 *  - `versions/<version>.yaml` — the archived schema for this version
 *  - `openapi.yaml`            — always the latest schema
 *  - `versions/index.json`     — manifest of all known versions
 *
 * The version is the latest change date from the API changelog feed.
 */
export async function release(opts: ReleaseOptions): Promise<ReleaseResult> {
  const { docsProvider, changelogProvider, outDir = ".", logger = new ConsoleLogger() } = opts;

  const version = await changelogProvider.getLatestVersion();

  const generator = await new APIGenerator(docsProvider, logger).init();
  const doc = generator.buildOpenApiDocument(version);
  const yaml = stringifyYaml(doc);

  const versionsDir = join(outDir, "versions");
  const versionFile = join(versionsDir, `${version}.yaml`);
  const latestFile = join(outDir, "openapi.yaml");
  const manifestFile = join(versionsDir, "index.json");

  await Bun.write(versionFile, yaml);
  await Bun.write(latestFile, yaml);
  await updateManifest(manifestFile, version, `${version}.yaml`);

  logger.info(`Released schema version ${version} -> ${versionFile} (and ${latestFile})`);
  return { version, versionFile, latestFile };
}

/**
 * Upserts a version into the manifest. Existing versions keep their original
 * `generatedAt`, so re-running a build for an unchanged feed produces no diff.
 */
async function updateManifest(path: string, version: string, file: string): Promise<void> {
  let manifest: Manifest = { latest: version, versions: [] };

  const existing = Bun.file(path);
  if (await existing.exists()) {
    try {
      manifest = JSON.parse(await existing.text()) as Manifest;
    } catch {
      // Corrupt/empty manifest — start fresh.
    }
  }

  if (!manifest.versions.some((v) => v.version === version)) {
    manifest.versions.push({ version, file, generatedAt: new Date().toISOString() });
  }

  // Newest first (YYYY-MM-DD sorts chronologically).
  manifest.versions.sort((a, b) => (a.version < b.version ? 1 : -1));
  manifest.latest = manifest.versions[0]?.version ?? version;

  await Bun.write(path, JSON.stringify(manifest, null, 2) + "\n");
}

if (import.meta.main) {
  // Usage:
  //   bun ./gen/release.ts             fetch live docs + live changelog feed
  //   bun ./gen/release.ts --offline   build from the committed fixtures (deterministic)
  const offline = process.argv.includes("--offline");

  const docsProvider = offline
    ? new FileDocsProvider("fixtures/full-docs.html")
    : new FetchDocsProvider();
  const changelogProvider = offline
    ? new FileChangelogProvider("fixtures/feed.xml")
    : new FetchChangelogProvider();

  await release({ docsProvider, changelogProvider });
}
