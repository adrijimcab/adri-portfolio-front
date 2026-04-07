import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../blog.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-3xl px-6 py-24">
      <header class="mb-16">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /blog
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">Writing</h1>
        <p class="mt-4 max-w-xl text-white/60">
          Notes on the things I build, the decisions behind them, and the bugs I had to learn the
          hard way. Short, technical, and updated when I have something worth saying.
        </p>
      </header>

      @if (posts().length === 0) {
        <p class="text-white/50">No posts yet. Check back soon.</p>
      } @else {
        <ul class="space-y-8">
          @for (post of posts(); track post.slug) {
            <li
              class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <a [routerLink]="['/blog', post.slug]" class="block">
                <div class="flex items-center gap-3 text-xs text-white/40">
                  <time [attr.datetime]="post.date">{{ post.date | date: 'longDate' }}</time>
                  <span aria-hidden="true">·</span>
                  <span>{{ post.readingTimeMinutes }} min read</span>
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

  readonly posts = computed(() => this.blog.getAllPosts());

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Blog — Adrián Jiménez Cabello',
      description:
        'Technical writing on Angular, NestJS, Supabase and the things I learn shipping software.',
      url: 'https://adrianjimenezcabello.dev/blog',
    });
  }
}
