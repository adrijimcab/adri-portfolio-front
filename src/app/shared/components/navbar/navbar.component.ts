import { Component, ChangeDetectionStrategy, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="fixed top-0 z-50 w-full border-b border-white/[0.06] transition-all duration-300"
         [class]="scrolled() ? 'bg-black/80 backdrop-blur-xl' : 'bg-transparent'">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a routerLink="/" class="text-lg font-bold text-white">
          AJC<span style="color: var(--color-secondary);">.</span>
        </a>

        <!-- Desktop nav -->
        <div class="hidden items-center gap-8 md:flex">
          <a href="/#about" class="text-sm text-white/60 transition-colors hover:text-white">About</a>
          <a href="/#experience" class="text-sm text-white/60 transition-colors hover:text-white">Experience</a>
          <a href="/#tech-stack" class="text-sm text-white/60 transition-colors hover:text-white">Stack</a>
          <a routerLink="/projects" routerLinkActive="text-white" class="text-sm text-white/60 transition-colors hover:text-white">Projects</a>
          <a routerLink="/cv" class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all"
             style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
            CV
          </a>
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
            <a href="/#about" class="text-sm text-white/60" (click)="mobileOpen.set(false)">About</a>
            <a href="/#experience" class="text-sm text-white/60" (click)="mobileOpen.set(false)">Experience</a>
            <a href="/#tech-stack" class="text-sm text-white/60" (click)="mobileOpen.set(false)">Stack</a>
            <a routerLink="/projects" class="text-sm text-white/60" (click)="mobileOpen.set(false)">Projects</a>
            <a routerLink="/cv" class="text-sm text-white/60" (click)="mobileOpen.set(false)">CV</a>
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly mobileOpen = signal(false);
  readonly scrolled = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 50);
      });
    }
  }
}
