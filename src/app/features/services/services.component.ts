import type { OnDestroy, OnInit } from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  PLATFORM_ID,
  afterNextRender,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

interface ServiceCard {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const ORIGIN = 'https://adrianjimenezcabello.dev';

const SERVICES: readonly ServiceCard[] = [
  {
    icon: '🎨',
    title: 'Diseño UI/UX Premium',
    description:
      'Interfaces intuitivas y atractivas con las últimas tendencias. Cada píxel tiene un propósito.',
  },
  {
    icon: '⚡',
    title: 'Rendimiento Optimizado',
    description:
      'Sitios rápidos, SEO técnico, Core Web Vitals perfectos. Tu web carga antes de que parpadees.',
  },
  {
    icon: '🏗️',
    title: 'Arquitectura Escalable',
    description:
      'Clean Architecture, código mantenible y preparado para crecer. Hoy funciona, mañana escala.',
  },
];

const TECH_STACK: readonly string[] = [
  'Angular',
  'React',
  'Next.js',
  'NestJS',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'Vercel',
];

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [SectionHeaderComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen px-6 pt-24 pb-20">
      <div class="mx-auto max-w-6xl">
        <!-- Hero -->
        <section class="mb-24 flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <!-- 3D Brain -->
          <div class="flex w-full justify-center lg:w-1/2">
            <div
              class="relative mx-auto w-72 md:w-96"
              [style.transform]="
                'perspective(800px) rotateY(' +
                mouseX() * 18 +
                'deg) rotateX(' +
                -mouseY() * 14 +
                'deg) translateX(' +
                mouseX() * 20 +
                'px) translateY(' +
                mouseY() * 15 +
                'px) scale3d(1.02, 1.02, 1.02)'
              "
              style="will-change: transform; transition: transform 0.1s ease-out;"
            >
              <!-- Glow behind brain -->
              <div
                class="absolute inset-0 rounded-full opacity-30 blur-3xl"
                style="background: radial-gradient(circle, var(--color-primary), var(--color-secondary), transparent);"
              ></div>
              <!-- Brain image -->
              <img
                src="/hero-brain.jpg"
                alt="Cerebro IA - Desarrollo web inteligente"
                class="relative rounded-full"
                loading="lazy"
              />
              <!-- Rotating rings -->
              <div
                class="absolute inset-[-10%] animate-spin rounded-full border border-white/10"
                style="animation-duration: 20s;"
              ></div>
              <div
                class="absolute inset-[-20%] animate-spin rounded-full border border-white/5"
                style="animation-duration: 30s; animation-direction: reverse;"
              ></div>
            </div>
          </div>

          <!-- Hero text -->
          <div class="w-full text-center lg:w-1/2 lg:text-left" appScrollAnimate>
            <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
              /services
            </p>
            <h1 class="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Desarrollo Web Profesional
            </h1>
            <p class="mt-6 max-w-xl text-lg text-white/60">
              Creo experiencias web de alto rendimiento para negocios que quieren destacar.
            </p>
          </div>
        </section>

        <!-- Services grid -->
        <section class="mb-24" appScrollAnimate>
          <app-section-header title="Lo que ofrezco" label="Servicios" />

          <div class="grid gap-6 md:grid-cols-3" appScrollAnimate [stagger]="true">
            @for (service of services; track service.title) {
              <article
                class="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
              >
                <span class="mb-4 block text-4xl">{{ service.icon }}</span>
                <h3 class="mb-3 text-xl font-semibold text-white">{{ service.title }}</h3>
                <p class="text-sm leading-relaxed text-white/50">{{ service.description }}</p>
              </article>
            }
          </div>
        </section>

        <!-- Tech stack -->
        <section class="mb-24" appScrollAnimate>
          <app-section-header title="Tecnologías" label="Stack" />

          <div class="flex flex-wrap justify-center gap-3">
            @for (tech of techStack; track tech) {
              <span
                class="rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/70 backdrop-blur-xl transition-colors duration-200 hover:border-white/[0.12] hover:text-white"
              >
                {{ tech }}
              </span>
            }
          </div>
        </section>

        <!-- CTA -->
        <section class="text-center" appScrollAnimate>
          <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">
            ¿Tienes un proyecto en mente?
          </h2>
          <p class="mx-auto mb-8 max-w-lg text-white/50">
            Cuéntame tu idea y busquemos juntos la mejor solución técnica.
          </p>
          <a
            href="/#contact"
            class="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"
          >
            Hablemos
          </a>
        </section>
      </div>
    </main>
  `,
})
export class ServicesComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mouseX = signal(0);
  readonly mouseY = signal(0);
  readonly services = SERVICES;
  readonly techStack = TECH_STACK;

  private animationId = 0;
  private readonly onMouseMove = (e: MouseEvent): void => {
    this.targetX = e.clientX / window.innerWidth - 0.5;
    this.targetY = e.clientY / window.innerHeight - 0.5;
  };

  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      document.addEventListener('mousemove', this.onMouseMove);

      const animate = (): void => {
        this.currentX += (this.targetX - this.currentX) * 0.08;
        this.currentY += (this.targetY - this.currentY) * 0.08;
        this.mouseX.set(this.currentX);
        this.mouseY.set(this.currentY);
        this.animationId = requestAnimationFrame(animate);
      };
      this.animationId = requestAnimationFrame(animate);
    });
  }

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Desarrollo Web Profesional — Adrián Jiménez Cabello',
      description:
        'Creo experiencias web de alto rendimiento para negocios que quieren destacar. Diseño UI/UX, rendimiento optimizado y arquitectura escalable.',
      url: `${ORIGIN}/services`,
    });

    this.seo.setBreadcrumbList([
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Services', url: `${ORIGIN}/services` },
    ]);

    this.seo.setProfessionalServiceSchema();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}
