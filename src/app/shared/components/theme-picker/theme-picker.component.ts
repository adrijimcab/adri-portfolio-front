import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../toast/toast.service';

interface ThemeColor {
  key: string;
  label: string;
  cssVar: string;
  value: string;
}

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3">
      @for (color of colors(); track color.key) {
        <label class="group relative cursor-pointer" [title]="color.label">
          <input
            type="color"
            [ngModel]="color.value"
            (ngModelChange)="updateColor(color, $event)"
            class="h-6 w-6 cursor-pointer appearance-none rounded-full border border-white/10 bg-transparent"
          />
        </label>
      }
      <button
        (click)="saveTheme()"
        [disabled]="saving()"
        class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
      >
        {{ saving() ? 'Saving...' : 'Save' }}
      </button>
    </div>
  `,
  styles: `
    input[type='color'] {
      -webkit-appearance: none;
      border: none;
      padding: 0;
    }
    input[type='color']::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    input[type='color']::-webkit-color-swatch {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
  `,
})
export class ThemePickerComponent {
  private readonly theme = inject(ThemeService);
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);

  readonly colors = signal<ThemeColor[]>([
    { key: 'primary_color', label: 'Primary', cssVar: '--color-primary', value: '#6366f1' },
    { key: 'secondary_color', label: 'Secondary', cssVar: '--color-secondary', value: '#a855f7' },
    { key: 'accent_color', label: 'Accent', cssVar: '--color-accent', value: '#ec4899' },
    { key: 'background_color', label: 'Background', cssVar: '--color-bg', value: '#000000' },
  ]);

  updateColor(color: ThemeColor, value: string): void {
    color.value = value;
    document.documentElement.style.setProperty(color.cssVar, value);
  }

  saveTheme(): void {
    this.saving.set(true);
    const config: Record<string, string> = {};
    for (const c of this.colors()) {
      config[c.key] = c.value;
    }
    this.admin.updateSiteConfig(config).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Theme saved successfully');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to save theme');
      },
    });
  }
}
