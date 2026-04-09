import { Injectable } from '@angular/core';
import { marked } from 'marked';

type CalloutType = 'note' | 'warning' | 'tip';

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: 'Note',
  warning: 'Warning',
  tip: 'Tip',
};

/**
 * Regex that matches GitHub-flavored callout syntax inside a `<blockquote>`:
 *
 *   <blockquote>\n<p>[!NOTE]\nContent...</p>\n</blockquote>
 *
 * Supports NOTE, WARNING and TIP (case-insensitive).
 */
const CALLOUT_RE =
  /<blockquote>\s*<p>\[!(NOTE|WARNING|TIP)\]\s*<br\s*\/?>\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi;

/**
 * Fallback pattern for when `marked` doesn't emit `<br>` between the tag and content
 * (depends on `breaks` option). Catches the variant where the content is simply on the next line.
 */
const CALLOUT_RE_ALT =
  /<blockquote>\s*<p>\[!(NOTE|WARNING|TIP)\]\s*\n?([\s\S]*?)<\/p>\s*<\/blockquote>/gi;

/**
 * Shared markdown-to-HTML renderer.
 * SSR-safe (synchronous), GFM enabled.
 * Reusable across blog posts, chat widget, and any future markdown consumers.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  /**
   * Render markdown to HTML synchronously.
   * Code blocks are emitted as plain `<pre><code class="language-xxx">` so the
   * caller can later upgrade them (e.g. with shiki) inside `afterNextRender`.
   * Callout syntax (`[!NOTE]`, `[!WARNING]`, `[!TIP]`) inside blockquotes
   * is automatically converted to styled callout divs.
   */
  render(markdown: string): string {
    const raw = marked.parse(markdown, { async: false, gfm: true, breaks: false });
    const html = typeof raw === 'string' ? raw : '';
    return this.transformCallouts(html);
  }

  /**
   * Converts GitHub-style callout blockquotes into styled callout divs.
   */
  private transformCallouts(html: string): string {
    const replacer = (_match: string, type: string, body: string): string => {
      const kind = type.toLowerCase() as CalloutType;
      const label = CALLOUT_LABELS[kind];
      return (
        `<div class="callout callout-${kind}" role="note">` +
        `<strong class="callout-title">${label}</strong>` +
        `<p>${body.trim()}</p>` +
        `</div>`
      );
    };

    let result = html.replace(CALLOUT_RE, replacer);
    result = result.replace(CALLOUT_RE_ALT, replacer);
    return result;
  }
}
