import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable} from 'rxjs';
import { catchError, map, of } from 'rxjs';
import { marked } from 'marked';
import { POSTS } from '../../../content/posts/posts';
import { environment } from '../../../environments/environment';
import type { BlogPost } from './blog.types';

interface RecordViewResponse {
  readonly slug: string;
  readonly view_count: number;
}

interface ViewCountEntry {
  readonly post_slug: string;
  readonly view_count: number;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly blogApiBase = `${environment.apiUrl}/blog/posts`;

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

  /**
   * Records a view for the given post slug.
   * Fails silently if the API is unreachable — the feature is optional.
   */
  recordView(slug: string): Observable<RecordViewResponse> {
    return this.http
      .post<RecordViewResponse>(`${this.blogApiBase}/${encodeURIComponent(slug)}/view`, {})
      .pipe(
        catchError(() => of<RecordViewResponse>({ slug, view_count: 0 })),
      );
  }

  /**
   * Fetches all post view counts and returns them as a Map keyed by slug
   * for O(1) lookup. Returns an empty Map on failure.
   */
  getAllViewCounts(): Observable<Map<string, number>> {
    return this.http.get<readonly ViewCountEntry[]>(`${this.blogApiBase}/views`).pipe(
      map((entries) => {
        const map = new Map<string, number>();
        for (const entry of entries) {
          map.set(entry.post_slug, entry.view_count);
        }
        return map;
      }),
      catchError(() => of(new Map<string, number>())),
    );
  }
}
