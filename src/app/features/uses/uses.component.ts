import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

interface UsesItem {
  name: string;
  description: string;
  url?: string;
}

interface UsesGroup {
  title: string;
  items: UsesItem[];
}

@Component({
  selector: 'app-uses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-3xl px-6 py-24">
      <header class="mb-16">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /uses
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">My setup</h1>
        <p class="mt-4 max-w-xl text-white/60">
          Hardware, editor, terminal, and everyday tools I use to build things.
          Updated whenever something changes for real, not just for trends.
        </p>
      </header>

      @for (group of groups; track group.title) {
        <section class="mb-16">
          <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
            {{ group.title }}
          </h2>
          <ul class="space-y-4">
            @for (item of group.items; track item.name) {
              <li class="border-l-2 border-white/10 pl-4">
                <p class="font-medium text-white">
                  @if (item.url) {
                    <a [href]="item.url" target="_blank" rel="noopener noreferrer" class="hover:text-white/70">
                      {{ item.name }} ↗
                    </a>
                  } @else {
                    {{ item.name }}
                  }
                </p>
                <p class="mt-1 text-sm text-white/50">{{ item.description }}</p>
              </li>
            }
          </ul>
        </section>
      }
    </main>
  `,
})
export class UsesComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly groups: UsesGroup[] = [
    {
      title: 'Hardware',
      items: [
        { name: 'MacBook (Apple Silicon)', description: 'Daily driver for development.' },
        { name: 'External display', description: 'Productivity boost for split layouts.' },
        { name: 'Mechanical keyboard', description: 'Tactile feedback, low actuation.' },
      ],
    },
    {
      title: 'Editor & Terminal',
      items: [
        { name: 'VS Code', description: 'Primary editor with Angular and TypeScript extensions.', url: 'https://code.visualstudio.com' },
        { name: 'iTerm2 + Zsh', description: 'Terminal of choice with custom prompt and aliases.' },
        { name: 'Tmux', description: 'Session multiplexer for parallel workflows.' },
        { name: 'Claude Code', description: 'AI pair-programmer for orchestrated workflows.', url: 'https://claude.com/code' },
      ],
    },
    {
      title: 'Languages & Frameworks',
      items: [
        { name: 'Angular 21', description: 'Frontend framework with standalone, signals, SSR.', url: 'https://angular.dev' },
        { name: 'NestJS', description: 'Backend framework on Node.js with strong typing.', url: 'https://nestjs.com' },
        { name: 'TypeScript', description: 'Static types everywhere, strict mode on.', url: 'https://www.typescriptlang.org' },
        { name: 'Tailwind 4', description: 'Utility-first CSS for rapid UI iteration.', url: 'https://tailwindcss.com' },
      ],
    },
    {
      title: 'Infra & Hosting',
      items: [
        { name: 'Vercel', description: 'Frontend hosting with auto preview deploys.', url: 'https://vercel.com' },
        { name: 'Railway', description: 'Backend container deployments.', url: 'https://railway.com' },
        { name: 'Supabase', description: 'Postgres + auth + storage all-in-one.', url: 'https://supabase.com' },
        { name: 'Cloudflare', description: 'DNS and registrar.', url: 'https://cloudflare.com' },
      ],
    },
    {
      title: 'CLI & Productivity',
      items: [
        { name: 'gh', description: 'GitHub CLI for everything I would do in the web UI.', url: 'https://cli.github.com' },
        { name: 'rg / fd / bat / eza', description: 'Modern Rust replacements for grep / find / cat / ls.' },
        { name: 'jq', description: 'JSON manipulation in pipelines.', url: 'https://jqlang.github.io/jq/' },
      ],
    },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Uses — Adrián Jiménez Cabello',
      description: 'Hardware, editor, terminal and tools I use every day to build software.',
      url: 'https://adrianjimenezcabello.dev/uses',
    });
  }
}
