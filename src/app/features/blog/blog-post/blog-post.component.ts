import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

  private readonly articleEl = viewChild<ElementRef<HTMLElement>>('articleEl');

  protected readonly post = signal<BlogPost | undefined>(undefined);
  protected readonly viewCount = signal<number | null>(null);
  private readonly rawHtml = computed<string>(() => {
    const current = this.post();
    if (!current) return '';
    return this.blog.renderMarkdown(current.content);
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
    this.blog.recordView(current.slug).subscribe((res) => {
      if (res.view_count > 0) {
        this.viewCount.set(res.view_count);
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      void this.router.navigate(['/blog']);
      return;
    }
    const found = this.blog.getPostBySlug(slug);
    if (!found) {
      void this.router.navigate(['/blog']);
      return;
    }
    this.post.set(found);
    this.seo.updateMeta({
      title: `${found.title} — Adrián Jiménez Cabello`,
      description: found.description,
      url: `https://adrianjimenezcabello.dev/blog/${found.slug}`,
      image: 'https://adrianjimenezcabello.dev/og-image.png',
    });
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
  }
}
