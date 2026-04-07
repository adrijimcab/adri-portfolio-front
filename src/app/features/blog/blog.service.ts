import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { POSTS } from '../../../content/posts/posts';
import type { BlogPost } from './blog.types';

@Injectable({ providedIn: 'root' })
export class BlogService {
  getAllPosts(): readonly BlogPost[] {
    return POSTS;
  }

  getPostBySlug(slug: string): BlogPost | undefined {
    return POSTS.find((post) => post.slug === slug);
  }

  /**
   * Render markdown to HTML synchronously, SSR-safe.
   * Code blocks are emitted as plain `<pre><code class="language-xxx">` so the
   * client can later upgrade them with shiki inside `afterNextRender`.
   */
  renderMarkdown(markdown: string): string {
    const result = marked.parse(markdown, { async: false, gfm: true, breaks: false });
    return typeof result === 'string' ? result : '';
  }
}
