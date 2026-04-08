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
        <div class="flex items-center justify-center gap-2 py-2 text-xs text-white/40">
          <svg viewBox="0 0 24 24" class="h-4 w-4 fill-[#1DB954]" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Loading…</span>
        </div>
      } @else if (track(); as t) {
        <a
          [href]="t.songUrl ?? '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="group mx-auto flex max-w-md flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-[#1DB954]/30 hover:bg-white/[0.04]"
        >
          <!-- Spotify brand row -->
          <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1DB954]">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-[#1DB954]" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Spotify</span>
            <span class="text-white/30">·</span>
            @if (t.isPlaying) {
              <span class="flex items-center gap-1.5">
                <span>Now playing</span>
                <span class="flex h-3 items-end gap-[2px]" aria-hidden="true">
                  <span class="block w-[2px] animate-[spotify-bar_0.9s_ease-in-out_infinite] bg-[#1DB954]" style="height: 100%;"></span>
                  <span class="block w-[2px] animate-[spotify-bar_0.9s_ease-in-out_0.2s_infinite] bg-[#1DB954]" style="height: 100%;"></span>
                  <span class="block w-[2px] animate-[spotify-bar_0.9s_ease-in-out_0.4s_infinite] bg-[#1DB954]" style="height: 100%;"></span>
                </span>
              </span>
            } @else {
              <span class="text-white/40">Last played</span>
            }
          </div>

          <!-- Track info row -->
          <div class="flex items-center gap-3">
            <div class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/[0.04]">
              @if (t.albumImageUrl) {
                <img
                  [src]="t.albumImageUrl"
                  [alt]="t.album ?? ''"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              } @else {
                <svg viewBox="0 0 24 24" class="h-7 w-7 fill-[#1DB954]" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              }
            </div>

            <div class="min-w-0 flex-1 text-left">
              <div class="truncate text-sm font-medium text-white group-hover:text-[#1DB954]">
                {{ t.title }}
              </div>
              <div class="truncate text-xs text-white/60">{{ t.artist }}</div>
              @if (t.isPlaying && t.durationMs && t.progressMs != null) {
                <div class="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    class="h-full bg-[#1DB954] transition-all duration-1000 ease-linear"
                    [style.width.%]="progressPercent(t)"
                  ></div>
                </div>
              }
            </div>
          </div>
        </a>
      }
    }

    <style>
      @keyframes spotify-bar {
        0%, 100% { transform: scaleY(0.35); }
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
