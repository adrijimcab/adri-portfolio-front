import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef, afterNextRender } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { TranslateService } from '../../../core/services/translate.service';
import { MagneticDirective } from '../../directives/magnetic.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LanguageToggleComponent, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="fixed top-0 z-50 w-full border-b border-white/[0.06] transition-all duration-300"
         [class]="scrolled() ? 'bg-black/80 backdrop-blur-xl' : 'bg-transparent'">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a routerLink="/" class="text-lg font-bold text-white">
          AJC<span style="color: var(--color-secondary);">.</span>
        </a>

        <!-- Desktop nav -->
        <div class="hidden items-center gap-6 md:flex">
          <a href="/#about" class="text-sm text-white/60 transition-colors hover:text-white">{{ t.t('nav.about') }}</a>
          <a href="/#experience" class="text-sm text-white/60 transition-colors hover:text-white">{{ t.t('nav.experience') }}</a>
          <a href="/#tech-stack" class="text-sm text-white/60 transition-colors hover:text-white">{{ t.t('nav.stack') }}</a>
          <a routerLink="/projects" routerLinkActive="text-white" class="text-sm text-white/60 transition-colors hover:text-white">{{ t.t('nav.projects') }}</a>
          <a routerLink="/cv" appMagnetic [strength]="0.18"
             class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all"
             style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
            {{ t.t('nav.cv') }}
          </a>

          <!-- LinkedIn icon -->
          <a href="https://www.linkedin.com/in/adrianjimenezcabello"
             target="_blank"
             rel="noopener noreferrer"
             class="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-[#0077B5]"
             aria-label="LinkedIn">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          <app-language-toggle />
        </div>

        <!-- Mobile hamburger -->
        <button class="md:hidden text-white" (click)="mobileOpen.set(!mobileOpen())">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (mobileOpen()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div class="border-t border-white/[0.06] bg-black/95 backdrop-blur-xl px-6 py-4 md:hidden">
          <div class="flex flex-col gap-4">
            <a href="/#about" class="text-sm text-white/60" (click)="mobileOpen.set(false)">{{ t.t('nav.about') }}</a>
            <a href="/#experience" class="text-sm text-white/60" (click)="mobileOpen.set(false)">{{ t.t('nav.experience') }}</a>
            <a href="/#tech-stack" class="text-sm text-white/60" (click)="mobileOpen.set(false)">{{ t.t('nav.stack') }}</a>
            <a routerLink="/projects" class="text-sm text-white/60" (click)="mobileOpen.set(false)">{{ t.t('nav.projects') }}</a>
            <a routerLink="/cv" class="text-sm text-white/60" (click)="mobileOpen.set(false)">{{ t.t('nav.cv') }}</a>
            <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
              <app-language-toggle />
              <a href="https://www.linkedin.com/in/adrianjimenezcabello"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-[#0077B5]"
                 aria-label="LinkedIn">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  readonly t = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  readonly mobileOpen = signal(false);
  readonly scrolled = signal(false);

  constructor() {
    afterNextRender(() => {
      const onScroll = () => this.scrolled.set(window.scrollY > 50);
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }
}
