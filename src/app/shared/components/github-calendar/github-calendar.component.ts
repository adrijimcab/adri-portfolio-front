import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../../../core/services/translate.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionResponse {
  total: { lastYear: number };
  contributions: ContributionDay[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface CalendarDay {
  date: string;
  count: number;
  color: string;
  label: string;
  isEmpty: boolean;
}

const COLORS = [
  'rgba(255,255,255,0.03)',
  'rgba(99,102,241,0.3)',
  'rgba(99,102,241,0.5)',
  'rgba(168,85,247,0.7)',
  'rgba(236,72,153,0.9)',
];

const API_URL = 'https://github-contributions-api.jogruber.de/v4/adrijimcab?y=last';

function getColor(count: number): string {
  if (count === 0) return COLORS[0];
  if (count <= 3) return COLORS[1];
  if (count <= 7) return COLORS[2];
  if (count <= 12) return COLORS[3];
  return COLORS[4];
}

@Component({
  selector: 'app-github-calendar',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="mb-8">
        <app-skeleton-loader height="140px" />
      </div>
    } @else if (weeks().length) {
      <div class="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
        <!-- Month labels -->
        <div class="overflow-x-auto pb-2">
          <div class="min-w-[720px]">
            <div class="mb-1 flex text-[10px] text-white/30" style="padding-left: 32px;">
              @for (month of months(); track month.label + month.offset) {
                <span
                  class="shrink-0"
                  [style.width.px]="month.width"
                  [style.margin-left.px]="month.offset">
                  {{ month.label }}
                </span>
              }
            </div>

            <!-- Grid -->
            <div class="flex gap-[3px]">
              <!-- Day labels -->
              <div class="flex shrink-0 flex-col gap-[3px] text-[10px] text-white/30" style="width: 28px;">
                <span class="h-[11px]">&nbsp;</span>
                <span class="flex h-[11px] items-center">{{ t.t('github.cal_mon') }}</span>
                <span class="h-[11px]">&nbsp;</span>
                <span class="flex h-[11px] items-center">{{ t.t('github.cal_wed') }}</span>
                <span class="h-[11px]">&nbsp;</span>
                <span class="flex h-[11px] items-center">{{ t.t('github.cal_fri') }}</span>
                <span class="h-[11px]">&nbsp;</span>
              </div>

              <!-- Weeks -->
              @for (week of weeks(); track $index) {
                <div class="flex flex-col gap-[3px]">
                  @for (day of week.days; track $index) {
                    @if (day.isEmpty) {
                      <div class="h-[11px] w-[11px]"></div>
                    } @else {
                      <div
                        class="group relative h-[11px] w-[11px] rounded-sm transition-transform hover:scale-150"
                        [style.background-color]="day.color">
                        <div class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
                          <strong>{{ day.count }}</strong> {{ day.count === 1 ? t.t('github.cal_contribution') : t.t('github.cal_contributions') }} {{ t.t('github.cal_on') }} {{ day.label }}
                          <div class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            </div>

            <!-- Legend -->
            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs text-white/40">
                {{ total() }} {{ t.t('github.cal_total') }}
              </span>
              <div class="flex items-center gap-1 text-[10px] text-white/30">
                <span>{{ t.t('github.cal_less') }}</span>
                @for (color of legendColors; track $index) {
                  <div class="h-[11px] w-[11px] rounded-sm" [style.background-color]="color"></div>
                }
                <span>{{ t.t('github.cal_more') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class GithubCalendarComponent {
  readonly t = inject(TranslateService);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(true);
  readonly total = signal(0);
  readonly weeks = signal<CalendarWeek[]>([]);
  readonly months = signal<{ label: string; offset: number; width: number }[]>([]);

  readonly legendColors = COLORS;

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.fetchContributions();
      }
    });
  }

  private fetchContributions(): void {
    this.http.get<ContributionResponse>(API_URL).subscribe({
      next: (data) => {
        this.total.set(data.total.lastYear);
        this.buildCalendar(data.contributions);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private buildCalendar(contributions: ContributionDay[]): void {
    const byDate = new Map<string, ContributionDay>();
    for (const c of contributions) {
      byDate.set(c.date, c);
    }

    const today = new Date();
    // Go back ~52 weeks to the nearest Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - 363); // 52 weeks = 364 days, but we want 52 full columns + partial
    // Align to Sunday (start of week for GitHub calendar)
    start.setDate(start.getDate() - start.getDay());

    const weeks: CalendarWeek[] = [];
    const monthLabels: { label: string; offset: number; width: number }[] = [];
    const daySize = 11;
    const gap = 3;
    const colWidth = daySize + gap;

    let currentDate = new Date(start);
    let lastMonth = -1;
    let weekIndex = 0;

    while (currentDate <= today) {
      const week: CalendarDay[] = [];

      for (let dow = 0; dow < 7; dow++) {
        if (weekIndex === 0 && dow < start.getDay()) {
          week.push({ date: '', count: 0, color: 'transparent', label: '', isEmpty: true });
          continue;
        }

        if (currentDate > today) {
          week.push({ date: '', count: 0, color: 'transparent', label: '', isEmpty: true });
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        const dateStr = this.formatDate(currentDate);
        const entry = byDate.get(dateStr);
        const count = entry?.count ?? 0;

        const month = currentDate.getMonth();
        if (month !== lastMonth) {
          const monthName = currentDate.toLocaleDateString(this.t.currentLang() === 'es' ? 'es-ES' : 'en-US', { month: 'short' });
          const offset = weekIndex === 0 && monthLabels.length === 0 ? 0 : 0;
          monthLabels.push({
            label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            offset: 0,
            width: 0,
          });
          lastMonth = month;
        }

        week.push({
          date: dateStr,
          count,
          color: getColor(count),
          label: currentDate.toLocaleDateString(this.t.currentLang() === 'es' ? 'es-ES' : 'en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          isEmpty: false,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push({ days: week });
      weekIndex++;
    }

    // Calculate month label positions
    const processedMonths: { label: string; offset: number; width: number }[] = [];
    let monthWeekStart = 0;
    let currentMonth = -1;

    for (let wi = 0; wi < weeks.length; wi++) {
      const firstRealDay = weeks[wi].days.find(d => !d.isEmpty);
      if (!firstRealDay) continue;
      const d = new Date(firstRealDay.date);
      const m = d.getMonth();
      if (m !== currentMonth) {
        if (processedMonths.length > 0) {
          processedMonths[processedMonths.length - 1].width = (wi - monthWeekStart) * colWidth;
        }
        processedMonths.push({ label: this.getMonthLabel(d), offset: 0, width: 0 });
        monthWeekStart = wi;
        currentMonth = m;
      }
    }
    if (processedMonths.length > 0) {
      processedMonths[processedMonths.length - 1].width = (weeks.length - monthWeekStart) * colWidth;
    }

    this.weeks.set(weeks);
    this.months.set(processedMonths);
  }

  private getMonthLabel(date: Date): string {
    const name = date.toLocaleDateString(this.t.currentLang() === 'es' ? 'es-ES' : 'en-US', { month: 'short' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
