import type { ElementRef, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'isomorphic-dompurify';
import { BlogService } from '../blog.service';
import { SeoService } from '../../../core/services/seo.service';
import type { BlogPost } from '../blog.types';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (post(); as p) {
      <main class="mx-auto max-w-3xl px-6 py-24">
        <a
          routerLink="/blog"
          class="mb-12 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 transition hover:text-white"
        >
          &larr; Back to blog
        </a>

        <header class="mb-12">
          <div class="flex items-center gap-3 text-xs text-white/40">
            <time [attr.datetime]="p.date">{{ p.date | date: 'longDate' }}</time>
            <span aria-hidden="true">·</span>
            <span>{{ p.readingTimeMinutes }} min read</span>
            @if (viewCount() !== null) {
              <span aria-hidden="true">·</span>
              <span>{{ viewCount() }} views</span>
            }
          </div>
          <h1 class="mt-3 text-4xl font-bold text-white md:text-5xl">{{ p.title }}</h1>
          <p class="mt-4 text-lg text-white/60">{{ p.description }}</p>
        </header>

        <article
          #articleEl
          class="blog-prose prose prose-invert max-w-none"
          [innerHTML]="renderedHtml()"
        ></article>

        <footer class="mt-16 border-t border-white/10 pt-8">
          <a
            routerLink="/blog"
            class="text-xs uppercase tracking-wider text-white/50 transition hover:text-white"
          >
            &larr; Back to blog
          </a>
        </footer>
      </main>
    } @else {
      <main class="mx-auto max-w-3xl px-6 py-24 text-center">
        <p class="text-white/60">Loading post…</p>
      </main>
    }
  `,
  styles: [
    `
      .blog-prose {
        color: rgba(255, 255, 255, 0.78);
        font-size: 1.05rem;
        line-height: 1.75;
      }
      .blog-prose :is(h2) {
        color: #fff;
        font-size: 1.6rem;
        font-weight: 700;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
      }
      .blog-prose :is(h3) {
        color: #fff;
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
      }
      .blog-prose :is(p) {
        margin-top: 1rem;
        margin-bottom: 1rem;
      }
      .blog-prose :is(a) {
        color: #fff;
        text-decoration: underline;
        text-decoration-color: rgba(255, 255, 255, 0.3);
        text-underline-offset: 3px;
      }
      .blog-prose :is(a:hover) {
        text-decoration-color: rgba(255, 255, 255, 0.7);
      }
      .blog-prose :is(strong) {
        color: #fff;
        font-weight: 600;
      }
      .blog-prose :is(ul, ol) {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }
      .blog-prose :is(li) {
        margin: 0.4rem 0;
      }
      .blog-prose :is(code) {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.15rem 0.4rem;
        border-radius: 0.25rem;
        font-size: 0.9em;
        color: #fff;
      }
      .blog-prose :is(pre) {
        background: #0a0a0a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.75rem;
        padding: 1.25rem;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-size: 0.875rem;
        line-height: 1.6;
      }
      .blog-prose :is(pre code) {
        background: transparent;
        padding: 0;
        color: rgba(255, 255, 255, 0.85);
      }
      .blog-prose :is(blockquote) {
        border-left: 3px solid rgba(255, 255, 255, 0.2);
        padding-left: 1rem;
        margin: 1.25rem 0;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
      }

      /* Callout / admonition blocks */
      .blog-prose :is(.callout) {
        border-left: 3px solid;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
        margin: 1.5rem 0;
        font-style: normal;
      }
      .blog-prose :is(.callout-title) {
        display: block;
        margin-bottom: 0.35rem;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .blog-prose :is(.callout p) {
        margin: 0;
      }
      .blog-prose :is(.callout-note) {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.08);
      }
      .blog-prose :is(.callout-note .callout-title) {
        color: #60a5fa;
      }
      .blog-prose :is(.callout-warning) {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.08);
      }
      .blog-prose :is(.callout-warning .callout-title) {
        color: #fbbf24;
      }
      .blog-prose :is(.callout-tip) {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.08);
      }
      .blog-prose :is(.callout-tip .callout-title) {
        color: #4ade80;
      }
    `,
  ],
})
export class BlogPostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly articleEl = viewChild<ElementRef<HTMLElement>>('articleEl');

  protected readonly post = signal<BlogPost | undefined>(undefined);
  protected readonly viewCount = signal<number | null>(null);
  private readonly rawHtml = computed<string>(() => {
    const current = this.post();
    if (!current) return '';
    const rendered = this.blog.renderMarkdown(current.content);
    return DOMPurify.sanitize(rendered);
  });
  protected readonly renderedHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.rawHtml()),
  );

  constructor() {
    afterNextRender(() => {
      void this.applyShikiHighlight();
      this.recordPostView();
    });
  }

  private recordPostView(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const current = this.post();
    if (!current) return;
    this.blog
      .recordView(current.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.view_count > 0) {
          this.viewCount.set(res.view_count);
        }
      });
  }

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['post'] as BlogPost | null | undefined;
    if (!resolved) {
      void this.router.navigate(['/blog']);
      return;
    }
    this.post.set(resolved);
    const postUrl = `https://adrianjimenezcabello.dev/blog/${resolved.slug}`;
    this.seo.updateMeta({
      title: `${resolved.title} — Adrián Jiménez Cabello`,
      description: resolved.description,
      url: postUrl,
      image: 'https://adrianjimenezcabello.dev/og-image.png',
      type: 'article',
    });
    this.seo.setBlogPostingSchema({
      title: resolved.title,
      description: resolved.description,
      slug: resolved.slug,
      date: resolved.date,
      readingTimeMinutes: resolved.readingTimeMinutes,
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: 'https://adrianjimenezcabello.dev/' },
      { name: 'Blog', url: 'https://adrianjimenezcabello.dev/blog' },
      { name: resolved.title, url: postUrl },
    ]);
  }

  /**
   * Injects a floating "Copy" button into every `<pre>` code block.
   * Click copies the code text and shows brief "Copied" feedback.
   */
  private addCopyButtons(host: HTMLElement): void {
    const preBlocks = Array.from(host.querySelectorAll<HTMLPreElement>('pre'));
    for (const pre of preBlocks) {
      pre.style.position = 'relative';

      const btn = document.createElement('button');
      btn.textContent = 'Copy';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code to clipboard');

      // Position & style via inline styles (SSR-safe, no Tailwind runtime needed)
      Object.assign(btn.style, {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        padding: '0.25rem 0.6rem',
        fontSize: '0.75rem',
        lineHeight: '1',
        borderRadius: '0.375rem',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        zIndex: '10',
      } satisfies Partial<Record<string, string>>);

      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255,255,255,0.12)';
        btn.style.color = 'rgba(255,255,255,0.9)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(255,255,255,0.06)';
        btn.style.color = 'rgba(255,255,255,0.6)';
      });

      btn.addEventListener('click', () => {
        const codeEl = pre.querySelector('code');
        const text = codeEl?.textContent ?? pre.textContent ?? '';
        void navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '\u2713 Copied';
          btn.style.color = '#4ade80';
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.style.color = 'rgba(255,255,255,0.6)';
          }, 2000);
        });
      });

      pre.appendChild(btn);
    }
  }

  private async applyShikiHighlight(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const host = this.articleEl()?.nativeElement;
    if (!host) return;
    const codeBlocks = Array.from(
      host.querySelectorAll<HTMLElement>('pre > code[class*="language-"]'),
    );
    if (codeBlocks.length === 0) return;

    try {
      const { codeToHtml } = await import('shiki');
      for (const codeEl of codeBlocks) {
        const langMatch = /language-([\w-]+)/.exec(codeEl.className);
        const lang = langMatch?.[1] ?? 'text';
        const source = codeEl.textContent ?? '';
        const highlighted = await codeToHtml(source, {
          lang,
          theme: 'github-dark',
        });
        const pre = codeEl.parentElement;
        if (pre) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = highlighted;
          const newPre = wrapper.querySelector('pre');
          if (newPre) {
            newPre.classList.add('shiki-rendered');
            pre.replaceWith(newPre);
          }
        }
      }
    } catch {
      // Shiki failed (unsupported language, network issue) — leave plain <pre>.
    }

    this.addCopyButtons(host);
  }
}
