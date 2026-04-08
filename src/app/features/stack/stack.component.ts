import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

interface StackItem {
  name: string;
  why: string;
  url?: string;
}

interface StackCategory {
  title: string;
  items: StackItem[];
}

@Component({
  selector: 'app-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-3xl px-6 py-24">
      <header class="mb-16">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /stack
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">Tech stack</h1>
        <p class="mt-4 max-w-xl text-white/60">
          What this portfolio is built on, and what I reach for day to day. Every
          choice has a reason. No resume-driven development.
        </p>
      </header>

      @for (cat of categories; track cat.title) {
        <section class="mb-16">
          <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
            {{ cat.title }}
          </h2>
          <ul class="space-y-5">
            @for (item of cat.items; track item.name) {
              <li>
                <p class="font-medium text-white">
                  @if (item.url) {
                    <a [href]="item.url" target="_blank" rel="noopener noreferrer" class="hover:text-white/70">
                      {{ item.name }} ↗
                    </a>
                  } @else {
                    {{ item.name }}
                  }
                </p>
                <p class="mt-1 text-sm leading-relaxed text-white/50">{{ item.why }}</p>
              </li>
            }
          </ul>
        </section>
      }
    </main>
  `,
})
export class StackComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly categories: StackCategory[] = [
    {
      title: 'Frontend',
      items: [
        { name: 'Angular 21 (zoneless + signals)', why: 'No Zone.js, signals everywhere, SSR with hydration that actually replays events. The version that finally clicked for me.', url: 'https://angular.dev' },
        { name: 'Tailwind CSS 4', why: 'No BEM, no class wars. Design tokens live in CSS variables and you compose from there.', url: 'https://tailwindcss.com' },
        { name: 'Standalone components', why: 'No NgModules. Smaller bundles, lazy routes with loadComponent, less ceremony.' },
      ],
    },
    {
      title: 'Backend',
      items: [
        { name: 'NestJS', why: 'DI, guards, interceptors. Strict TypeScript feels at home here.', url: 'https://nestjs.com' },
        { name: 'Express 5 (under Nest)', why: 'The middleware ecosystem is mature. Helmet, throttler, validation pipes — they just work.' },
        { name: 'class-validator + class-transformer', why: 'DTO validation that lives next to the types instead of fighting them.' },
      ],
    },
    {
      title: 'Database',
      items: [
        { name: 'Supabase (Postgres)', why: 'It\'s real Postgres, with RLS, auth and storage on top. One vendor instead of stitching three together.', url: 'https://supabase.com' },
        { name: 'Migrations as code', why: 'Versioned SQL in the repo, pushed to production with supabase db push.' },
        { name: 'Row Level Security', why: 'Authorization lives in the database. Reads are public, writes are admin-only, and the rule is right next to the schema.' },
      ],
    },
    {
      title: 'Hosting & deployment',
      items: [
        { name: 'Vercel', why: 'Auto-deploy from GitHub. Preview URL on every PR. I never have to think about it.', url: 'https://vercel.com' },
        { name: 'Railway', why: 'The NestJS API runs here. Same story: push to main, container redeploys.', url: 'https://railway.com' },
        { name: 'Cloudflare DNS', why: 'Just registrar and DNS. Proxy off. Vercel handles SSL.', url: 'https://cloudflare.com' },
      ],
    },
    {
      title: 'Quality & security',
      items: [
        { name: 'CSP, HSTS, X-Frame-Options', why: 'Tells the browser exactly where scripts and frames can come from. Cheap insurance.' },
        { name: 'Two-tier rate limiting', why: 'Generous on public endpoints, strict on auth. Slows brute force without annoying real users.' },
        { name: 'Sanitized exception filter', why: 'Production gets a generic error. Full stack traces stay on the server, where they belong.' },
      ],
    },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Stack — Adrián Jiménez Cabello',
      description: 'What this portfolio runs on, and why I picked each piece.',
      url: 'https://adrianjimenezcabello.dev/stack',
    });
  }
}
