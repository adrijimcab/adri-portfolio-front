import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  afterNextRender,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

interface SpotifyNowPlaying {
  isPlaying: boolean;
  configured: boolean;
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  albumImageUrl?: string | null;
  songUrl?: string | null;
  durationMs?: number | null;
  progressMs?: number | null;
}

const POLL_INTERVAL_MS = 30_000;

@Component({
  selector: 'app-spotify-now-playing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showWidget()) {
      @if (loading()) {
        <div class="flex items-center justify-center gap-2 py-2 text-xs text-white/30">
          <div class="h-2 w-2 animate-pulse rounded-full bg-[#1DB954]"></div>
          <span>Loading...</span>
        </div>
      } @else if (track(); as t) {
        <a
          [href]="t.songUrl ?? '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="group mx-auto flex max-w-md items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 transition-colors hover:border-[#1DB954]/30 hover:bg-white/[0.04]"
          [attr.aria-label]="(t.isPlaying ? 'Now playing: ' : 'Last played: ') + t.title + ' by ' + t.artist"
        >
          <!-- Spotify icon + animated bars -->
          <div class="relative flex h-8 w-8 shrink-0 items-center justify-center">
            @if (t.albumImageUrl) {
              <img
                [src]="t.albumImageUrl"
                [alt]="t.album ?? ''"
                class="h-8 w-8 rounded-md object-cover"
                loading="lazy"
              />
            } @else {
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-[#1DB954]" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            }
            @if (t.isPlaying) {
              <div class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-black">
                <div class="flex h-1.5 items-end gap-[1px]">
                  <span class="h-full w-[2px] animate-[spotify-bar_0.8s_ease-in-out_infinite] bg-[#1DB954]"></span>
                  <span class="h-full w-[2px] animate-[spotify-bar_0.8s_ease-in-out_0.2s_infinite] bg-[#1DB954]"></span>
                  <span class="h-full w-[2px] animate-[spotify-bar_0.8s_ease-in-out_0.4s_infinite] bg-[#1DB954]"></span>
                </div>
              </div>
            }
          </div>

          <div class="min-w-0 flex-1 text-left">
            <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#1DB954]">
              @if (t.isPlaying) {
                <span>Now playing</span>
              } @else {
                <span class="text-white/40">Last played</span>
              }
            </div>
            <div class="truncate text-sm text-white/90 group-hover:text-white">
              {{ t.title }}
            </div>
            <div class="truncate text-xs text-white/50">{{ t.artist }}</div>
            @if (t.isPlaying && t.durationMs && t.progressMs != null) {
              <div class="mt-1 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  class="h-full bg-[#1DB954] transition-all duration-1000 ease-linear"
                  [style.width.%]="progressPercent(t)"
                ></div>
              </div>
            }
          </div>
        </a>
      }
    }

    <style>
      @keyframes spotify-bar {
        0%, 100% { transform: scaleY(0.3); }
        50% { transform: scaleY(1); }
      }
    </style>
  `,
})
export class SpotifyNowPlayingComponent {
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly track = signal<SpotifyNowPlaying | null>(null);

  readonly showWidget = (): boolean => {
    const t = this.track();
    if (this.loading()) return true;
    if (!t) return false;
    return t.configured !== false;
  };

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.startPolling();
    });
  }

  progressPercent(t: SpotifyNowPlaying): number {
    if (!t.durationMs || t.progressMs == null) return 0;
    return Math.min(100, Math.max(0, (t.progressMs / t.durationMs) * 100));
  }

  private startPolling(): void {
    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.api.get<SpotifyNowPlaying>('spotify/now-playing').pipe(
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          this.loading.set(false);
          if (data) this.track.set(data);
        },
      });
  }
}
