import * as cheerio from 'cheerio';

/**
 * The Speedy API has no version numbers — changes are announced in an RSS feed
 * and tracked by date only. We therefore derive the schema version from the most
 * recent change date in that feed.
 */
export interface ChangelogProvider {
  /** Returns the latest API change date as an ISO `YYYY-MM-DD` string. */
  getLatestVersion(): string | Promise<string>;
}

export const SPEEDY_FEED_URL = "https://services.speedy.bg/api/feed/";

export class FetchChangelogProvider implements ChangelogProvider {
  constructor(private readonly url: string = SPEEDY_FEED_URL) { }

  async getLatestVersion(): Promise<string> {
    const res = await fetch(this.url);
    return parseLatestFeedDate(await res.text());
  }
}

export class FileChangelogProvider implements ChangelogProvider {
  constructor(private readonly filePath: string) { }

  async getLatestVersion(): Promise<string> {
    return parseLatestFeedDate(await Bun.file(this.filePath).text());
  }
}

/**
 * Parses an RSS feed and returns the most recent `<item><pubDate>` value.
 * The feed's items are not ordered, so we take the lexicographic maximum of the
 * `YYYY-MM-DD` dates (which equals the chronological maximum for that format).
 */
export function parseLatestFeedDate(xml: string): string {
  const $ = cheerio.load(xml, { xmlMode: true });

  const dates = $("item > pubDate")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

  const latest = dates.sort().at(-1);
  if (!latest) throw new Error("Could not find any pubDate entries in the changelog feed");

  return latest;
}
