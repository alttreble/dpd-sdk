import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';

export class DocsNormalizer {
  // Elements whose text content must be left untouched (it isn't document prose).
  private static readonly SKIP_TAGS = new Set(["script", "style", "textarea"]);

  /**
   * The source documentation contains a lot of "loose" text that lives directly
   * next to element nodes (mixed content), e.g.:
   *
   *   <h3>2.1. Shipment Service</h3>
   *   <span class="spanWebService">Web service URL:</span> BASE_URL/shipment
   *
   * Here `BASE_URL/shipment` is a bare text node sitting between elements.
   * Cheerio's sibling traversal (`.next()`, `.children()`) skips text nodes, so
   * this information is invisible when we later walk the DOM tree.
   *
   * This normalizer wraps every such loose text node in a `<span>`, turning the
   * document into a clean tree of elements that can be traversed reliably.
   */
  normalize(html: string): string {
    const $ = cheerio.load(html, {
      // Keep it HTML-mode (not XML)
      xmlMode: false,
    });

    this.wrapLooseText($, $.root().toArray()[0]);

    return $.html();
  }

  /**
   * Recursively walks the tree and replaces every non-whitespace text node that
   * lives in mixed content (i.e. has at least one element sibling) with a
   * `<span>` wrapping the same text. Text that is the sole content of an element
   * (e.g. `<td>userName</td>`) is already addressable and is left as-is.
   */
  private wrapLooseText($: cheerio.CheerioAPI, node: AnyNode | undefined): void {
    if (!node) return;

    // Iterate a static snapshot of the children since we mutate the tree.
    for (const child of $(node).contents().toArray()) {
      if (child.type === "text") {
        const text = child.data ?? "";
        if (text.trim() === "") continue;

        const hasElementSibling = (child.parent?.children ?? []).some(
          (sibling) => sibling !== child && sibling.type === "tag"
        );
        if (!hasElementSibling) continue;

        // Using .text(text) ensures HTML special chars in the text are escaped.
        $(child).replaceWith($("<span>").text(text));
      } else if (child.type === "tag") {
        if (DocsNormalizer.SKIP_TAGS.has(child.name)) continue;
        this.wrapLooseText($, child);
      }
    }
  }
}

