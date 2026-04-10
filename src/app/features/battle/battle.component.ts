import type { OnInit, OnDestroy } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

type BattlePhase = 'idle' | 'fighting' | 'result';

interface Skill {
  readonly name: string;
  readonly power: number;
}

const SITE_ORIGIN = 'https://adrianjimenezcabello.dev';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [SectionHeaderComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-h-screen px-6 pt-24 pb-16">
      <div class="mx-auto max-w-6xl">
        <app-section-header title="Frontend vs Backend" label="Jedi Battle" />

        <section appScrollAnimate class="mx-auto max-w-4xl">
          <!-- Arena -->
          <div
            class="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 md:p-10"
          >
            <!-- Jedi Fighters -->
            <div class="flex flex-col items-center gap-8 md:flex-row md:justify-between">
              <!-- Frontend Jedi -->
              <div class="flex flex-col items-center gap-4 text-center">
                <div class="relative">
                  <img
                    src="/jedi-front.png"
                    alt="Frontend Jedi"
                    class="h-32 w-32 rounded-full object-cover md:h-40 md:w-40"
                    [style.boxShadow]="'0 0 30px hsla(185, 100%, 50%, 0.3)'"
                  />
                  @if (clashEffect() === 'front') {
                    <div
                      class="absolute inset-0 animate-ping rounded-full"
                      [style.background]="'hsla(185, 100%, 50%, 0.3)'"
                    ></div>
                  }
                </div>
                <h3 class="text-xl font-bold" [style.color]="'hsl(185, 100%, 50%)'">Frontend</h3>
                <!-- HP Bar -->
                <div class="h-4 w-48 overflow-hidden rounded-full bg-white/10">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [style.width.%]="frontHP()"
                    [style.background]="'linear-gradient(90deg, hsl(185, 100%, 40%), hsl(185, 100%, 60%))'"
                    [style.boxShadow]="'0 0 12px hsla(185, 100%, 50%, 0.5)'"
                  ></div>
                </div>
                <span class="text-sm text-white/60">{{ frontHP() }}% HP</span>
              </div>

              <!-- VS Badge -->
              <div class="flex flex-col items-center gap-2">
                <span
                  class="text-4xl font-black tracking-wider md:text-5xl"
                  [style.background]="'linear-gradient(135deg, hsl(185, 100%, 50%), hsl(260, 100%, 65%))'"
                  style="-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
                  >VS</span
                >
              </div>

              <!-- Backend Jedi -->
              <div class="flex flex-col items-center gap-4 text-center">
                <div class="relative">
                  <img
                    src="/jedi-back.png"
                    alt="Backend Jedi"
                    class="h-32 w-32 rounded-full object-cover md:h-40 md:w-40"
                    [style.boxShadow]="'0 0 30px hsla(260, 100%, 65%, 0.3)'"
                  />
                  @if (clashEffect() === 'back') {
                    <div
                      class="absolute inset-0 animate-ping rounded-full"
                      [style.background]="'hsla(260, 100%, 65%, 0.3)'"
                    ></div>
                  }
                </div>
                <h3 class="text-xl font-bold" [style.color]="'hsl(260, 100%, 65%)'">Backend</h3>
                <!-- HP Bar -->
                <div class="h-4 w-48 overflow-hidden rounded-full bg-white/10">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [style.width.%]="backHP()"
                    [style.background]="'linear-gradient(90deg, hsl(260, 100%, 55%), hsl(260, 100%, 75%))'"
                    [style.boxShadow]="'0 0 12px hsla(260, 100%, 65%, 0.5)'"
                  ></div>
                </div>
                <span class="text-sm text-white/60">{{ backHP() }}% HP</span>
              </div>
            </div>

            <!-- Battle Message -->
            <div class="mt-8 min-h-[60px] text-center">
              @if (currentMessage()) {
                <p class="text-lg font-semibold text-white/90 md:text-xl">
                  {{ currentMessage() }}
                </p>
              }
            </div>

            <!-- Action Button -->
            <div class="mt-6 flex justify-center">
              @if (phase() === 'idle') {
                <button
                  type="button"
                  class="rounded-xl px-8 py-3 text-lg font-bold text-white transition-all hover:scale-105"
                  [style.background]="'linear-gradient(135deg, hsl(185, 100%, 50%), hsl(260, 100%, 65%))'"
                  [style.boxShadow]="'0 0 20px hsla(220, 100%, 60%, 0.3)'"
                  (click)="startBattle()"
                >
                  &#161;Iniciar Batalla!
                </button>
              }
              @if (phase() === 'result') {
                <div class="flex flex-col items-center gap-4">
                  <p
                    class="text-3xl font-black md:text-4xl"
                    [style.background]="'linear-gradient(135deg, hsl(185, 100%, 50%), hsl(260, 100%, 65%))'"
                    style="-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
                  >
                    &#161;EMPATE!
                  </p>
                  <p class="text-white/60">Juntos son imparables</p>
                  <button
                    type="button"
                    class="rounded-xl border border-white/20 bg-white/[0.05] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-white/[0.1]"
                    (click)="reset()"
                  >
                    Repetir
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Skills Comparison -->
          <div appScrollAnimate [delay]="200" class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            <!-- Frontend Skills -->
            <div
              class="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6"
            >
              <h3 class="mb-6 text-center text-lg font-bold" [style.color]="'hsl(185, 100%, 50%)'">
                Frontend Skills
              </h3>
              <div class="flex flex-col gap-4">
                @for (skill of frontSkills; track skill.name) {
                  <div>
                    <div class="mb-1 flex justify-between text-sm">
                      <span class="text-white/80">{{ skill.name }}</span>
                      <span class="text-white/50">{{ skill.power }}%</span>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        class="h-full rounded-full transition-all duration-1000"
                        [style.width.%]="skill.power"
                        [style.background]="'linear-gradient(90deg, hsl(185, 100%, 40%), hsl(185, 100%, 60%))'"
                        [style.boxShadow]="'0 0 8px hsla(185, 100%, 50%, 0.4)'"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Backend Skills -->
            <div
              class="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6"
            >
              <h3 class="mb-6 text-center text-lg font-bold" [style.color]="'hsl(260, 100%, 65%)'">
                Backend Skills
              </h3>
              <div class="flex flex-col gap-4">
                @for (skill of backSkills; track skill.name) {
                  <div>
                    <div class="mb-1 flex justify-between text-sm">
                      <span class="text-white/80">{{ skill.name }}</span>
                      <span class="text-white/50">{{ skill.power }}%</span>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        class="h-full rounded-full transition-all duration-1000"
                        [style.width.%]="skill.power"
                        [style.background]="'linear-gradient(90deg, hsl(260, 100%, 55%), hsl(260, 100%, 75%))'"
                        [style.boxShadow]="'0 0 8px hsla(260, 100%, 65%, 0.4)'"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class BattleComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly phase = signal<BattlePhase>('idle');
  readonly currentMessage = signal('');
  readonly frontHP = signal(100);
  readonly backHP = signal(100);
  readonly clashEffect = signal<'front' | 'back' | null>(null);

  readonly frontSkills: readonly Skill[] = [
    { name: 'CSS Grid Imposible', power: 92 },
    { name: 'State Management', power: 88 },
    { name: 'Pixel Perfect', power: 95 },
    { name: 'Responsive Hell', power: 90 },
    { name: 'Performance', power: 85 },
  ];

  readonly backSkills: readonly Skill[] = [
    { name: 'Database Design', power: 93 },
    { name: 'API Architecture', power: 91 },
    { name: 'Security & Auth', power: 94 },
    { name: 'Scaling Infra', power: 89 },
    { name: 'DevOps CI/CD', power: 87 },
  ];

  readonly battleMessages: readonly string[] = [
    '\u2694\uFE0F \u00A1FRONT lanza un ataque de CSS Grid anidado!',
    '\uD83D\uDEE1\uFE0F BACK contraataca con una query N+1 resuelta',
    '\u26A1 \u00A1FRONT esquiva con un useEffect bien optimizado!',
    '\uD83D\uDD25 BACK invoca el poder de las Edge Functions',
    '\uD83D\uDCA5 \u00A1FRONT despliega un layout con 12 breakpoints!',
    '\uD83C\uDF00 BACK responde con una arquitectura de microservicios',
    '\u2B50 \u00A1FRONT activa el modo SSR + Hydration!',
    '\uD83D\uDDE1\uFE0F BACK contraataca con WebSockets en tiempo real',
    '\uD83D\uDCAB \u00A1Pero juntos... son IMPARABLES!',
  ];

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Frontend vs Backend Jedi Battle | Adri\u00E1n Jim\u00E9nez Cabello',
      description:
        'La batalla definitiva entre Frontend y Backend. \u00BFQui\u00E9n ganar\u00E1? Spoiler: juntos son imparables.',
      url: `${SITE_ORIGIN}/battle`,
      type: 'website',
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Battle', url: `${SITE_ORIGIN}/battle` },
    ]);
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  startBattle(): void {
    this.phase.set('fighting');
    this.frontHP.set(100);
    this.backHP.set(100);

    let messageIndex = 0;

    this.intervalId = setInterval(() => {
      if (messageIndex >= this.battleMessages.length) {
        this.clearInterval();
        this.phase.set('result');
        this.currentMessage.set('');
        return;
      }

      const message = this.battleMessages[messageIndex];
      this.currentMessage.set(message);

      // Determine which side gets hit (alternate, last message is neutral)
      const isLastMessage = messageIndex === this.battleMessages.length - 1;
      if (!isLastMessage) {
        const hitsFront = messageIndex % 2 === 1; // Even = front attacks (back gets hit), Odd = back attacks (front gets hit)
        const damage = Math.floor(Math.random() * 8) + 5; // 5-12 damage

        if (hitsFront) {
          this.frontHP.update((hp) => Math.max(15, hp - damage));
          this.clashEffect.set('front');
        } else {
          this.backHP.update((hp) => Math.max(15, hp - damage));
          this.clashEffect.set('back');
        }

        // Clear clash effect after animation
        setTimeout(() => this.clashEffect.set(null), 500);
      }

      messageIndex++;
    }, 2000);
  }

  reset(): void {
    this.clearInterval();
    this.phase.set('idle');
    this.currentMessage.set('');
    this.frontHP.set(100);
    this.backHP.set(100);
    this.clashEffect.set(null);
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
