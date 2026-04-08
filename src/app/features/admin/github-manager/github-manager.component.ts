import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { GitHubRepo } from '../../../core/domain/entities';

/**
 * Not migrated to GenericCrudComponent: this screen has no create/edit
 * form and no delete — the data flows in from a GitHub sync action,
 * and each row exposes two inline toggles (visible, pinned). Different
 * lifecycle, different UI, so it stays bespoke.
 */

@Component({
  selector: 'app-github-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">GitHub Repos</h1>
        <button
          (click)="sync()"
          [disabled]="syncing()"
          class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
        >
          {{ syncing() ? 'Syncing...' : 'Sync Now' }}
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-white/[0.06] bg-white/[0.02]">
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">Name</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">Language</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">Stars</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">Forks</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">Visible</th>
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">Pinned</th>
            </tr>
          </thead>
          <tbody>
            @for (repo of repos(); track repo.id) {
              <tr class="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                <td class="px-4 py-3">
                  <a [href]="repo.html_url" target="_blank" class="text-indigo-400 hover:underline">
                    {{ repo.name }}
                  </a>
                  @if (repo.description) {
                    <p class="mt-0.5 text-xs text-white/30">{{ repo.description }}</p>
                  }
                </td>
                <td class="px-4 py-3 text-white/60">{{ repo.language ?? '-' }}</td>
                <td class="px-4 py-3 text-white/60">{{ repo.stargazers_count }}</td>
                <td class="px-4 py-3 text-white/60">{{ repo.forks_count }}</td>
                <td class="px-4 py-3">
                  <button
                    (click)="toggleVisible(repo)"
                    class="rounded px-2 py-1 text-xs transition-colors"
                    [class]="repo.is_visible ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.04] text-white/30'"
                  >
                    {{ repo.is_visible ? 'Yes' : 'No' }}
                  </button>
                </td>
                <td class="px-4 py-3">
                  <button
                    (click)="togglePinned(repo)"
                    class="rounded px-2 py-1 text-xs transition-colors"
                    [class]="repo.is_pinned ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/[0.04] text-white/30'"
                  >
                    {{ repo.is_pinned ? 'Yes' : 'No' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-white/30">
                  No repos found. Click "Sync Now" to fetch from GitHub.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class GithubManagerComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly repos = signal<(GitHubRepo & { is_visible: boolean })[]>([]);
  readonly syncing = signal(false);

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.admin
      .getGithubRepos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.repos.set(items as (GitHubRepo & { is_visible: boolean })[]),
      });
  }

  sync(): void {
    this.syncing.set(true);
    this.admin
      .syncGithub()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.syncing.set(false);
          this.toast.success(`Synced ${res.synced} repos`);
          this.loadData();
        },
        error: () => {
          this.syncing.set(false);
          this.toast.error('Sync failed');
        },
      });
  }

  toggleVisible(repo: GitHubRepo & { is_visible: boolean }): void {
    this.admin
      .updateGithubRepo(repo.id, { is_visible: !repo.is_visible } as Partial<GitHubRepo>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          repo.is_visible = !repo.is_visible;
          this.repos.update((r) => [...r]);
          this.toast.success('Updated');
        },
        error: () => this.toast.error('Failed to update'),
      });
  }

  togglePinned(repo: GitHubRepo & { is_visible: boolean }): void {
    this.admin
      .updateGithubRepo(repo.id, { is_pinned: !repo.is_pinned } as Partial<GitHubRepo>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          repo.is_pinned = !repo.is_pinned;
          this.repos.update((r) => [...r]);
          this.toast.success('Updated');
        },
        error: () => this.toast.error('Failed to update'),
      });
  }
}
