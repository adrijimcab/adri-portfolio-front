import { Component, ChangeDetectionStrategy, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle/language-toggle.component';
import { ThemePickerComponent } from '../../../shared/components/theme-picker/theme-picker.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    LanguageToggleComponent, ThemePickerComponent, ToastComponent, ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile overlay -->
    @if (sidebarOpen()) {
      <div class="fixed inset-0 z-30 bg-black/60 lg:hidden" (click)="sidebarOpen.set(false)" (keydown.escape)="sidebarOpen.set(false)" tabindex="-1" role="button" aria-label="Close sidebar"></div>
    }

    <div class="flex h-screen bg-black text-white">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/[0.06] bg-black/90 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0"
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
          <span
            class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent"
            >AJC.</span
          >
          <span class="text-xs text-white/30">Admin Panel</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto p-4">
          <ul class="space-y-1">
            @for (item of navItems; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-white/[0.08] text-white"
                  [routerLinkActiveOptions]="{ exact: item.path === '/admin' }"
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/80"
                  (click)="sidebarOpen.set(false)"
                >
                  <span class="text-base" [innerHTML]="item.icon"></span>
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <!-- Logout -->
        <div class="border-t border-white/[0.06] p-4">
          <button
            (click)="auth.logout()"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <span>&#x2192;</span>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- Toolbar -->
        <header
          class="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-black/50 px-4 backdrop-blur-xl lg:px-6"
        >
          <div class="flex items-center gap-3">
            <!-- Mobile menu button -->
            <button
              (click)="sidebarOpen.set(!sidebarOpen())"
              class="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white lg:hidden"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <app-theme-picker />
            <app-language-toggle />
            @if (auth.currentUser(); as user) {
              <span class="text-xs text-white/40">{{ user.email }}</span>
            }
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast />
    <app-confirm-dialog />
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly sidebarOpen = signal(false);

  readonly navItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: '&#x2302;' },
    { path: '/admin/profile', label: 'Profile', icon: '&#x263A;' },
    { path: '/admin/experiences', label: 'Experiences', icon: '&#x2692;' },
    { path: '/admin/projects', label: 'Projects', icon: '&#x2B1A;' },
    { path: '/admin/technologies', label: 'Technologies', icon: '&#x2699;' },
    { path: '/admin/education', label: 'Education', icon: '&#x1F393;' },
    { path: '/admin/certifications', label: 'Certifications', icon: '&#x2713;' },
    { path: '/admin/github', label: 'GitHub', icon: '&#x2687;' },
    { path: '/admin/social', label: 'Social Links', icon: '&#x260D;' },
    { path: '/admin/config', label: 'Site Config', icon: '&#x2318;' },
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // close sidebar on resize to desktop
      const mql = window.matchMedia('(min-width: 1024px)');
      mql.addEventListener('change', (e) => {
        if (e.matches) this.sidebarOpen.set(false);
      });
    }
  }
}
