import { test, expect } from "bun:test";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtemp } from "fs/promises";
import { parseLatestFeedDate, FileChangelogProvider } from "./changelog";
import { FileDocsProvider } from "./generate";
import { release } from "./release";

const feedPath = join(import.meta.dir, "../fixtures/feed.xml");
const docsPath = join(import.meta.dir, "../fixtures/full-docs.html");

test("parseLatestFeedDate returns the most recent (not the first) feed date", async () => {
  const xml = await Bun.file(feedPath).text();
  // The feed items are not ordered; the latest entry is 2026-05-12.
  expect(parseLatestFeedDate(xml)).toBe("2026-05-12");
});

test("FileChangelogProvider derives the version from the feed", async () => {
  const provider = new FileChangelogProvider(feedPath);
  expect(await provider.getLatestVersion()).toBe("2026-05-12");
});

test("release writes versioned artifacts, latest, and manifest", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "dpd-release-"));

  const result = await release({
    docsProvider: new FileDocsProvider(docsPath),
    changelogProvider: new FileChangelogProvider(feedPath),
    outDir,
  });

  expect(result.version).toBe("2026-05-12");

  // info.version is stamped into both the archived and the latest schema.
  const archived = await Bun.file(join(outDir, "versions/2026-05-12.yaml")).text();
  const latest = await Bun.file(join(outDir, "openapi.yaml")).text();
  expect(archived).toContain("version: 2026-05-12");
  expect(latest).toBe(archived);

  // Manifest points at the latest version.
  const manifest = JSON.parse(await Bun.file(join(outDir, "versions/index.json")).text());
  expect(manifest.latest).toBe("2026-05-12");
  expect(manifest.versions.map((v: { version: string }) => v.version)).toContain("2026-05-12");
});
