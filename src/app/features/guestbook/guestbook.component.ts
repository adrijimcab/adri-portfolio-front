import type { OnInit } from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../core/services/seo.service';
import { TranslateService } from '../../core/services/translate.service';
import { environment } from '../../../environments/environment';
import {
  GuestbookService,
  type GuestbookEntry,
  type GuestbookAuthResponse,
} from './guestbook.service';

const MAX_MESSAGE_LENGTH = 280;
const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';

@Component({
  selector: 'app-guestbook',
  standalone: true,
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-3xl px-6 py-24">
      <header class="mb-16">
        <p class="mb-3 text-xs uppercase tracking-[4px]" style="color: var(--color-secondary);">
          /guestbook
        </p>
        <h1 class="text-4xl font-bold text-white md:text-5xl">{{ t.t('guestbook.title') }}</h1>
        <p class="mt-4 max-w-xl text-white/60">
          {{ t.t('guestbook.subtitle') }}
        </p>
      </header>

      <!-- Auth / Form section -->
      <section class="mb-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        @if (auth()) {
          <div class="mb-4 flex items-center gap-3">
            <img
              [src]="auth()!.avatar_url"
              [alt]="auth()!.username"
              class="h-8 w-8 rounded-full ring-1 ring-white/10"
              width="32"
              height="32"
            />
            <span class="text-sm text-white/60">
              {{ t.t('guestbook.signed_as') }}
              <span class="font-semibold text-white">{{ '@' + auth()!.username }}</span>
            </span>
          </div>
          <form (ngSubmit)="submitEntry()" class="flex flex-col gap-3">
            <div class="relative">
              <textarea
                [(ngModel)]="newMessage"
                name="message"
                [placeholder]="t.t('guestbook.placeholder')"
                [maxlength]="maxLength"
                rows="3"
                class="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20"
                [attr.aria-label]="t.t('guestbook.placeholder')"
              ></textarea>
              <span class="absolute bottom-2 right-3 text-xs text-white/30">
                {{ charsRemaining() }} {{ t.t('guestbook.chars_remaining') }}
              </span>
            </div>
            <button
              type="submit"
              [disabled]="!canSubmit() || submitting()"
              class="self-end rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"
            >
              {{ submitting() ? t.t('guestbook.submitting') : t.t('guestbook.submit') }}
            </button>
          </form>
          @if (submitError()) {
            <p class="mt-3 text-sm text-red-400">{{ submitError() }}</p>
          }
        } @else {
          <button
            type="button"
            (click)="signInWithGitHub()"
            class="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            {{ t.t('guestbook.sign_button') }}
          </button>
          @if (authError()) {
            <p class="mt-3 text-sm text-red-400">{{ authError() }}</p>
          }
        }
      </section>

      <!-- Entries list -->
      <section>
        @if (loading()) {
          <div class="flex justify-center py-12">
            <div
              class="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80"
            ></div>
          </div>
        } @else if (entries().length === 0) {
          <p class="py-12 text-center text-white/40">{{ t.t('guestbook.empty') }}</p>
        } @else {
          <div class="space-y-6">
            @for (entry of entries(); track entry.id) {
              <article class="flex gap-4 border-b border-white/[0.06] pb-6 last:border-0">
                <img
                  [src]="entry.github_avatar_url"
                  [alt]="entry.github_username"
                  class="h-8 w-8 shrink-0 rounded-full ring-1 ring-white/10"
                  width="32"
                  height="32"
                  loading="lazy"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline gap-2">
                    <a
                      [href]="'https://github.com/' + entry.github_username"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm font-semibold text-white hover:underline"
                    >
                      {{ entry.github_username }}
                    </a>
                    <time [attr.datetime]="entry.created_at" class="text-xs text-white/30">
                      {{ entry.created_at | date: 'mediumDate' }}
                    </time>
                  </div>
                  <p class="mt-1 text-sm leading-relaxed text-white/70 break-words">
                    {{ entry.message }}
                  </p>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </main>
  `,
})
export class GuestbookComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly guestbookService = inject(GuestbookService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  readonly t = inject(TranslateService);

  readonly entries = signal<GuestbookEntry[]>([]);
  readonly loading = signal(true);
  readonly auth = signal<GuestbookAuthResponse | null>(null);
  readonly authError = signal('');
  readonly submitError = signal('');
  readonly submitting = signal(false);
  readonly newMessage = signal('');
  readonly maxLength = MAX_MESSAGE_LENGTH;

  readonly charsRemaining = computed(() => MAX_MESSAGE_LENGTH - this.newMessage().length);
  readonly canSubmit = computed(
    () => this.newMessage().trim().length > 0 && this.newMessage().length <= MAX_MESSAGE_LENGTH,
  );

  constructor() {
    // Handle OAuth callback code from query params
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      const code: unknown = params['code'];
      if (typeof code === 'string' && code.length > 0) {
        this.handleOAuthCallback(code);
      }
    });
  }

  ngOnInit(): void {
    this.seo.updateMeta({
      title: 'Guestbook — Adrian Jimenez Cabello',
      description:
        'Sign the guestbook with your GitHub account. Leave a message for the community.',
      url: 'https://adrianjimenezcabello.dev/guestbook',
      type: 'website',
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: 'https://adrianjimenezcabello.dev/' },
      { name: 'Guestbook', url: 'https://adrianjimenezcabello.dev/guestbook' },
    ]);

    this.loadEntries();
  }

  signInWithGitHub(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const clientId = environment.githubOAuthClientId;
    if (!clientId) {
      this.authError.set('GitHub OAuth is not configured.');
      return;
    }

    const lang = this.t.currentLang();
    const redirectUri = `${window.location.origin}/${lang}/guestbook`;
    const url = `${GITHUB_AUTHORIZE_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    window.location.href = url;
  }

  submitEntry(): void {
    const authData = this.auth();
    if (!authData || !this.canSubmit()) return;

    this.submitting.set(true);
    this.submitError.set('');

    this.guestbookService.createEntry(this.newMessage().trim(), authData.access_token).subscribe({
      next: (entry) => {
        // Optimistic prepend
        this.entries.update((current) => [entry, ...current]);
        this.newMessage.set('');
        this.submitting.set(false);
      },
      error: (err: unknown) => {
        const status = (err as { status?: number }).status;
        if (status === 429) {
          this.submitError.set(this.t.t('guestbook.rate_limited'));
        } else {
          this.submitError.set(this.t.t('guestbook.error_submit'));
        }
        this.submitting.set(false);
      },
    });
  }

  private loadEntries(): void {
    this.loading.set(true);
    this.guestbookService.listEntries().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private handleOAuthCallback(code: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Clean the URL of the code param
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());

    this.guestbookService.exchangeCode(code).subscribe({
      next: (response) => {
        this.auth.set(response);
        this.authError.set('');
      },
      error: () => {
        this.authError.set(this.t.t('guestbook.error_auth'));
      },
    });
  }
}
