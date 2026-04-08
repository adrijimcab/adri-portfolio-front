import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

interface Experiment {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly url: string;
  readonly external: boolean;
}

const SITE_ORIGIN = 'https://adrianjimenezcabello.dev';

@Component({
  selector: 'app-lab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-6xl px-6 py-24">
      <header class="mb-16 max-w-2xl">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /lab
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">Lab</h1>
        <p class="mt-4 text-white/60">
          Experimentos, demos y microsites. Cosas chiquitas que no son "proyectos de
          cliente" pero que me enseñaron algo — CSS, WebGL, generative, APIs raras y
          microinteracciones.
        </p>
      </header>

      <section
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Lista de experimentos"
      >
        @for (exp of experiments; track exp.title) {
          <a
            [href]="exp.url"
            [attr.target]="exp.external ? '_blank' : null"
            [attr.rel]="exp.external ? 'noopener noreferrer' : null"
            class="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            <h2 class="mb-2 text-lg font-semibold text-white group-hover:text-white">
              {{ exp.title }}
              @if (exp.external) {
                <span class="text-white/40">↗</span>
              }
            </h2>
            <p class="mb-6 flex-1 text-sm text-white/60">{{ exp.description }}</p>
            <ul class="flex flex-wrap gap-2">
              @for (tag of exp.tags; track tag) {
                <li
                  class="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-white/50"
                >
                  {{ tag }}
                </li>
              }
            </ul>
          </a>
        }
      </section>
    </main>
  `,
})
export class LabComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly experiments: readonly Experiment[] = [
    {
      title: 'WebGL Shader Background',
      description:
        'El shader GLSL que pinta el fondo del portfolio: animación continua y super barata en GPU.',
      tags: ['WebGL', 'GLSL'],
      url: '/',
      external: false,
    },
    {
      title: 'Konami Code Easter Egg',
      description:
        '↑ ↑ ↓ ↓ ← → ← → B A. Mirá la consola del browser para encontrarlo.',
      tags: ['DOM', 'UX'],
      url: '/',
      external: false,
    },
    {
      title: 'Command Palette ⌘K',
      description:
        'Paleta de comandos navegable 100% por teclado, con roles ARIA correctos.',
      tags: ['a11y', 'UX'],
      url: '/',
      external: false,
    },
    {
      title: 'Scroll-driven Progress Bar',
      description:
        'Barra de progreso de lectura usando scroll-driven animations nativas de CSS.',
      tags: ['CSS', 'UX'],
      url: '/',
      external: false,
    },
    {
      title: 'Particles Background',
      description:
        'Sistema de partículas generativo en canvas con tuning por device pixel ratio.',
      tags: ['Canvas', 'Generative'],
      url: '/',
      external: false,
    },
    {
      title: 'Spotify Now Playing',
      description:
        'Widget que muestra qué estoy escuchando ahora, hidratado en server con SSR.',
      tags: ['API', 'Realtime'],
      url: '/',
      external: false,
    },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Lab — Experimentos | Adrián Jiménez Cabello',
      description:
        'Experimentos, demos y microsites de Adrián. CSS, WebGL, generative, microinteracciones.',
      url: `${SITE_ORIGIN}/lab`,
      type: 'website',
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Lab', url: `${SITE_ORIGIN}/lab` },
    ]);
    this.seo.setItemList(
      this.experiments.map((e) => ({ name: e.title, url: `${SITE_ORIGIN}/lab` })),
      'schema-lab-list',
    );
  }
}
