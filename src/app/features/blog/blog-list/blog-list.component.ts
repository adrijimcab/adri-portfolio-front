import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../blog.service';
import { SeoService } from '../../../core/services/seo.service';
import { TranslateService } from '../../../core/services/translate.service';
import { HoverPreviewDirective } from '../../../shared/directives/hover-preview.directive';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe, HoverPreviewDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-3xl px-6 py-24">
      <header class="mb-16">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /blog
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">Writing</h1>
        <p class="mt-4 max-w-xl text-white/60">
          Notes on what I build and the bugs I had to learn the hard way. New posts when I actually
          have something worth saying.
        </p>
      </header>

      @if (posts().length === 0) {
        <p class="text-white/50">Nothing here yet.</p>
      } @else {
        <ul class="space-y-8">
          @for (post of posts(); track post.slug) {
            <li
              class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <a
                [routerLink]="['/', t.currentLang(), 'blog', post.slug]"
                [appHoverPreview]="post.slug"
                class="block"
              >
                <div class="flex items-center gap-3 text-xs text-white/40">
                  <time [attr.datetime]="post.date">{{ post.date | date: 'longDate' }}</time>
                  <span aria-hidden="true">·</span>
                  <span>{{ post.readingTimeMinutes }} min read</span>
                  @if (viewCountFor(post.slug); as count) {
                    <span aria-hidden="true">·</span>
                    <span>{{ count }} views</span>
                  }
                </div>
                <h2 class="mt-3 text-2xl font-semibold text-white">{{ post.title }}</h2>
                <p class="mt-2 text-white/60">{{ post.description }}</p>
                <p
                  class="mt-4 text-xs uppercase tracking-wider"
                  style="color: var(--color-secondary);"
                >
                  Read post &rarr;
                </p>
              </a>
            </li>
          }
        </ul>
      }
    </main>
  `,
})
export class BlogListComponent implements OnInit {
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly t = inject(TranslateService);

  readonly posts = computed(() => this.blog.getAllPosts());
  private readonly viewCounts = signal<ReadonlyMap<string, number>>(new Map());

  ngOnInit(): void {
    const origin = 'https://adrianjimenezcabello.dev';

    this.seo.updateMeta({
      title: 'Blog — Adrián Jiménez Cabello',
      description:
        'Technical writing on Angular, NestJS and Supabase, plus the things I learn while shipping.',
      url: `${origin}/blog`,
    });

    this.seo.setBreadcrumbList([
      { name: 'Home', url: `${origin}/` },
      { name: 'Blog', url: `${origin}/blog` },
    ]);

    const allPosts = this.blog.getAllPosts();
    if (allPosts.length > 0) {
      this.seo.setItemList(
        allPosts.map((p) => ({ name: p.title, url: `${origin}/blog/${p.slug}` })),
        'schema-blog-list',
      );
    }

    this.blog
      .getAllViewCounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((counts) => this.viewCounts.set(counts));
  }

  protected viewCountFor(slug: string): number | null {
    const value = this.viewCounts().get(slug);
    return value && value > 0 ? value : null;
  }
}
