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
          The technologies behind this portfolio and the day-to-day. Each pick has
          a real reason — no resume-driven development.
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
        { name: 'Angular 21 (zoneless + signals)', why: 'Reactive primitives without Zone.js. SSR with hydration and event replay built-in.', url: 'https://angular.dev' },
        { name: 'Tailwind CSS 4', why: 'No BEM, no class wars. Design tokens via CSS variables, utility composition.', url: 'https://tailwindcss.com' },
        { name: 'Standalone components', why: 'No NgModules. Lean tree-shakable bundles, lazy routes via loadComponent.' },
      ],
    },
    {
      title: 'Backend',
      items: [
        { name: 'NestJS', why: 'Modular DI, decorators, guards and interceptors. Pairs naturally with TypeScript strict.', url: 'https://nestjs.com' },
        { name: 'Express 5 (under Nest)', why: 'Mature middleware ecosystem. Helmet, throttler, validation pipes work out of the box.' },
        { name: 'class-validator + class-transformer', why: 'Declarative DTO validation tied to the type system.' },
      ],
    },
    {
      title: 'Database',
      items: [
        { name: 'Supabase (Postgres)', why: 'Real Postgres with RLS, auth, storage. One vendor for data, identity, files.', url: 'https://supabase.com' },
        { name: 'Migrations as code', why: 'Versioned SQL in the repo, applied via supabase db push to production.' },
        { name: 'Row Level Security', why: 'Authorization expressed in the database, not in app code. Reads public, writes admin-only.' },
      ],
    },
    {
      title: 'Hosting & deployment',
      items: [
        { name: 'Vercel', why: 'Auto-deploy from GitHub on push. Preview URLs per PR, edge network.', url: 'https://vercel.com' },
        { name: 'Railway', why: 'Container hosting for the NestJS API. Auto-redeploy on push.', url: 'https://railway.com' },
        { name: 'Cloudflare DNS', why: 'Registrar + DNS. Proxy off, Vercel handles SSL directly.', url: 'https://cloudflare.com' },
      ],
    },
    {
      title: 'Quality & security',
      items: [
        { name: 'CSP, HSTS, X-Frame-Options', why: 'Browser-enforced defense layers. Restrict where scripts and frames can come from.' },
        { name: 'Two-tier rate limiting', why: 'Public endpoints generous, auth endpoints aggressive. Slows brute force.' },
        { name: 'Sanitized exception filter', why: 'Generic error responses in production. Full stack traces only server-side.' },
      ],
    },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Stack — Adrián Jiménez Cabello',
      description: 'The technologies behind this portfolio and why each one was chosen.',
      url: 'https://adrianjimenezcabello.dev/stack',
    });
  }
}
