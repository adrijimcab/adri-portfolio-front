import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { TranslateService } from '../../core/services/translate.service';

interface NowBullet {
  readonly text: string;
}

interface NowList {
  readonly title: string;
  readonly items: readonly NowBullet[];
}

const LAST_UPDATED = '2026-04-08';

@Component({
  selector: 'app-now',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-3xl px-6 py-24">
      <header class="mb-16">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /now
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">En qué estoy ahora</h1>
        <p class="mt-4 max-w-xl text-white/60">
          Una foto honesta de mi foco actual: qué estoy construyendo, qué estoy aprendiendo y qué
          ando leyendo o escuchando estos días.
        </p>
        <p class="mt-6 text-xs uppercase tracking-widest text-white/40">
          Última actualización: {{ lastUpdated }}
        </p>
      </header>

      <section class="mb-16">
        <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
          Foco actual
        </h2>
        <ul class="space-y-4">
          @for (item of focusing; track item.text) {
            <li class="border-l-2 border-white/10 pl-4 text-white/70">
              {{ item.text }}
            </li>
          }
        </ul>
      </section>

      <section class="mb-16">
        <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
          Stack actual
        </h2>
        <p class="text-white/60">
          Mi setup diario vive en
          <a
            [routerLink]="['/', t.currentLang(), 'uses']"
            class="text-white underline underline-offset-4 hover:text-white/70"
          >
            /uses
          </a>
          y el detalle técnico del portfolio en
          <a
            [routerLink]="['/', t.currentLang(), 'stack']"
            class="text-white underline underline-offset-4 hover:text-white/70"
          >
            /stack
          </a>
          .
        </p>
      </section>

      @for (list of lists; track list.title) {
        <section class="mb-16">
          <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
            {{ list.title }}
          </h2>
          <ul class="space-y-4">
            @for (item of list.items; track item.text) {
              <li class="border-l-2 border-white/10 pl-4 text-white/70">
                {{ item.text }}
              </li>
            }
          </ul>
        </section>
      }

      <section class="mb-16">
        <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
          Dónde estoy
        </h2>
        <p class="text-white/70">Madrid, España · Zona horaria CET (UTC+1)</p>
      </section>

      <section class="mb-16">
        <h2 class="mb-6 text-xl font-semibold uppercase tracking-wider text-white/80">
          Disponible para
        </h2>
        <ul class="space-y-4">
          @for (item of availability; track item.text) {
            <li class="border-l-2 border-white/10 pl-4 text-white/70">
              {{ item.text }}
            </li>
          }
        </ul>
      </section>

      <footer class="border-t border-white/10 pt-8 text-sm text-white/40">
        Esta es una
        <a
          href="https://nownownow.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white/60 underline underline-offset-4 hover:text-white"
        >
          now page ↗
        </a>
        : una página personal donde cuento en qué estoy en este momento de la vida, no mi CV ni mi
        portfolio. Se actualiza cuando algo cambia de verdad.
      </footer>
    </main>
  `,
})
export class NowComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly t = inject(TranslateService);

  readonly lastUpdated = LAST_UPDATED;

  readonly focusing: readonly NowBullet[] = [
    { text: 'Angular 21 con SSR: zoneless, signals y rxResource como nueva normalidad.' },
    { text: 'Clean Architecture y Hexagonal aplicadas de verdad en proyectos reales.' },
    { text: 'Camino de Senior Architect: patrones, tradeoffs y decisiones no-obvias.' },
    { text: 'AI Engineering con Vercel AI SDK: agentes, tool calling y streaming.' },
    { text: 'Escribir más: posts, decisiones de arquitectura y lecciones aprendidas.' },
  ];

  readonly lists: readonly NowList[] = [
    {
      title: 'Leyendo',
      items: [
        { text: 'Designing Data-Intensive Applications — Martin Kleppmann' },
        { text: 'Architecture Patterns with Python — Cosmic Python (Percival & Gregory)' },
      ],
    },
    {
      title: 'Viendo',
      items: [
        { text: 'Charlas de ng-conf y EnterpriseNG sobre signals y zoneless.' },
        { text: 'Sesiones de system design en YouTube para afilar la intuición.' },
      ],
    },
    {
      title: 'Escuchando',
      items: [
        { text: 'Software Engineering Daily' },
        { text: 'Latent Space — The AI Engineer Podcast' },
        { text: 'Lex Fridman Podcast' },
      ],
    },
  ];

  readonly availability: readonly NowBullet[] = [
    { text: 'Freelance senior — proyectos de arquitectura frontend o full stack.' },
    { text: 'Contratos remotos — preferentemente long-term con equipos técnicos serios.' },
    { text: 'Charlas técnicas, mentoring y revisiones de código.' },
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: '/now — Adrián Jiménez Cabello',
      description:
        'En qué está trabajando Adrián ahora mismo: stack, lecturas, foco actual y disponibilidad.',
      url: 'https://adrianjimenezcabello.dev/now',
      type: 'profile',
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: 'https://adrianjimenezcabello.dev/' },
      { name: 'Now', url: 'https://adrianjimenezcabello.dev/now' },
    ]);
  }
}
