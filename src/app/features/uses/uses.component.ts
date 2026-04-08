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
          The stuff I actually use day to day. I update this page when something
          changes, not when a new tool goes viral.
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
        { name: 'MacBook (Apple Silicon)', description: 'My daily machine. Battery still surprises me.' },
        { name: 'External display', description: 'For long sessions where I need an editor and a browser side by side.' },
        { name: 'Mechanical keyboard', description: 'Low actuation switches. I type a lot, the wrists thank me.' },
      ],
    },
    {
      title: 'Editor & Terminal',
      items: [
        { name: 'VS Code', description: 'Where I live. A few Angular and TypeScript extensions and not much else.', url: 'https://code.visualstudio.com' },
        { name: 'iTerm2 + Zsh', description: 'Custom prompt, aliases I forgot I added years ago.' },
        { name: 'Tmux', description: 'One window, many panes. Hard to go back once you start using it.' },
        { name: 'Claude Code', description: 'My pair-programmer when I want to move faster than my hands let me.', url: 'https://claude.com/code' },
      ],
    },
    {
      title: 'Languages & Frameworks',
      items: [
        { name: 'Angular 21', description: 'Standalone, signals, SSR. The version I always wanted.', url: 'https://angular.dev' },
        { name: 'NestJS', description: 'Node on the backend without giving up structure.', url: 'https://nestjs.com' },
        { name: 'TypeScript', description: 'Strict mode, always. Anything else is borrowed time.', url: 'https://www.typescriptlang.org' },
        { name: 'Tailwind 4', description: 'I stopped fighting CSS naming and never looked back.', url: 'https://tailwindcss.com' },
      ],
    },
    {
      title: 'Infra & Hosting',
      items: [
        { name: 'Vercel', description: 'The frontend lives here. Preview deploys on every push.', url: 'https://vercel.com' },
        { name: 'Railway', description: 'Where the NestJS API runs. Push, redeploy, done.', url: 'https://railway.com' },
        { name: 'Supabase', description: 'Postgres with auth and storage on top. One vendor, less to babysit.', url: 'https://supabase.com' },
        { name: 'Cloudflare', description: 'Domain and DNS. Nothing fancy.', url: 'https://cloudflare.com' },
      ],
    },
    {
      title: 'CLI & Productivity',
      items: [
        { name: 'gh', description: 'GitHub CLI for everything I would do in the web UI.', url: 'https://cli.github.com' },
        { name: 'rg / fd / bat / eza', description: 'The modern Rust takes on grep, find, cat and ls. Once you switch, you can\'t unsee it.' },
        { name: 'jq', description: 'When a pipeline meets JSON.', url: 'https://jqlang.github.io/jq/' },
      ],
    },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Uses — Adrián Jiménez Cabello',
      description: 'The hardware, editor and tools I actually use every day to ship software.',
      url: 'https://adrianjimenezcabello.dev/uses',
    });
  }
}
