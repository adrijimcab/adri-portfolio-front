import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

interface StatCard {
  label: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <h1 class="text-2xl font-bold text-white">Dashboard</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <div
            class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl"
          >
            <p class="text-xs font-medium text-white/40 uppercase">{{ stat.label }}</p>
            <p class="mt-2 text-3xl font-bold" [style.color]="stat.color">{{ stat.count }}</p>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div>
        <h2 class="mb-4 text-lg font-semibold text-white/80">Quick Actions</h2>
        <div class="flex flex-wrap gap-3">
          <button
            (click)="syncGithub()"
            [disabled]="syncing()"
            class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
          >
            {{ syncing() ? 'Syncing...' : 'Sync GitHub Repos' }}
          </button>
        </div>
      </div>

      @if (lastSync()) {
        <p class="text-xs text-white/30">Last GitHub sync: {{ lastSync() }}</p>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stats = signal<StatCard[]>([]);
  readonly syncing = signal(false);
  readonly lastSync = signal('');

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    let experiences = 0;
    let projects = 0;
    let technologies = 0;
    let certifications = 0;

    this.admin
      .getExperiences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          experiences = data.length;
          this.updateStats(experiences, projects, technologies, certifications);
        },
      });
    this.admin
      .getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          projects = data.length;
          this.updateStats(experiences, projects, technologies, certifications);
        },
      });
    this.admin
      .getTechnologies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          technologies = data.length;
          this.updateStats(experiences, projects, technologies, certifications);
        },
        error: () => {
          /* technologies endpoint may return grouped data; fall through */
        },
      });
    this.admin
      .getCertifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          certifications = data.length;
          this.updateStats(experiences, projects, technologies, certifications);
        },
      });
  }

  private updateStats(exp: number, proj: number, tech: number, cert: number): void {
    this.stats.set([
      { label: 'Experiences', count: exp, color: '#6366f1' },
      { label: 'Projects', count: proj, color: '#a855f7' },
      { label: 'Technologies', count: tech, color: '#ec4899' },
      { label: 'Certifications', count: cert, color: '#14b8a6' },
    ]);
  }

  syncGithub(): void {
    this.syncing.set(true);
    this.admin
      .syncGithub()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.syncing.set(false);
          this.lastSync.set(new Date().toLocaleString());
          this.toast.success(`Synced ${res.synced} repositories`);
        },
        error: () => {
          this.syncing.set(false);
          this.toast.error('Failed to sync GitHub repos');
        },
      });
  }
}
