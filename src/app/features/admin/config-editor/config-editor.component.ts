import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { SectionConfig } from '../../../core/domain/entities';

/**
 * Not migrated to GenericCrudComponent: this screen juggles two
 * unrelated forms (a key/value SiteConfig table with typed inputs and
 * a sorted list of SectionConfig items with inline toggles). There is
 * no list -> form -> save cycle and no uniform entity, so forcing it
 * through the generic component would hurt more than help.
 */

interface ConfigEntry {
  key: string;
  value: string;
  type: 'color' | 'url' | 'number' | 'text';
}

@Component({
  selector: 'app-config-editor',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <h1 class="text-2xl font-bold text-white">Site Config</h1>

      <!-- Key-Value Config -->
      <div class="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
        <h2 class="mb-4 text-lg font-semibold text-white/80">Configuration</h2>
        <div class="space-y-3">
          @for (entry of configEntries(); track entry.key) {
            <div class="flex items-center gap-3">
              <label class="w-48 shrink-0 text-xs text-white/50">{{ entry.key }}</label>
              @switch (entry.type) {
                @case ('color') {
                  <input
                    type="color"
                    [ngModel]="entry.value"
                    (ngModelChange)="updateEntry(entry, $event)"
                    class="h-8 w-16 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                  <span class="text-xs text-white/30">{{ entry.value }}</span>
                }
                @case ('url') {
                  <input
                    type="url"
                    [ngModel]="entry.value"
                    (ngModelChange)="updateEntry(entry, $event)"
                    class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                  />
                }
                @case ('number') {
                  <input
                    type="number"
                    [ngModel]="entry.value"
                    (ngModelChange)="updateEntry(entry, $event)"
                    class="w-32 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                  />
                }
                @default {
                  <input
                    type="text"
                    [ngModel]="entry.value"
                    (ngModelChange)="updateEntry(entry, $event)"
                    class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                  />
                }
              }
            </div>
          }
        </div>

        <div class="mt-6 flex justify-end">
          <button
            (click)="saveConfig()"
            [disabled]="savingConfig()"
            class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {{ savingConfig() ? 'Saving...' : 'Save Config' }}
          </button>
        </div>
      </div>

      <!-- Sections Config -->
      <div class="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
        <h2 class="mb-4 text-lg font-semibold text-white/80">Sections</h2>
        <div class="space-y-2">
          @for (section of sections(); track section.id) {
            <div
              class="flex items-center gap-4 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <input
                type="number"
                [ngModel]="section.sort_order"
                (ngModelChange)="section.sort_order = $event"
                class="w-16 rounded border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-center text-sm text-white outline-none"
              />
              <span class="flex-1 text-sm text-white/80">{{ section.title }} ({{ section.section_key }})</span>
              <label class="flex items-center gap-2 text-xs text-white/50">
                <input
                  type="checkbox"
                  [ngModel]="section.is_visible"
                  (ngModelChange)="section.is_visible = $event"
                  class="accent-indigo-500"
                />
                Visible
              </label>
            </div>
          }
        </div>

        <div class="mt-6 flex justify-end">
          <button
            (click)="saveSections()"
            [disabled]="savingSections()"
            class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {{ savingSections() ? 'Saving...' : 'Save Sections' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfigEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly configEntries = signal<ConfigEntry[]>([]);
  readonly sections = signal<SectionConfig[]>([]);
  readonly savingConfig = signal(false);
  readonly savingSections = signal(false);

  ngOnInit(): void {
    this.admin
      .getSiteConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (config) => {
          const entries: ConfigEntry[] = Object.entries(config).map(([key, value]) => ({
            key,
            value,
            type: this.detectType(key, value),
          }));
          this.configEntries.set(entries);
        },
      });

    this.admin
      .getSections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sections) => this.sections.set(sections),
      });
  }

  updateEntry(entry: ConfigEntry, value: string): void {
    entry.value = value;
  }

  saveConfig(): void {
    this.savingConfig.set(true);
    const data: Record<string, string> = {};
    for (const e of this.configEntries()) {
      data[e.key] = e.value;
    }
    this.admin
      .updateSiteConfig(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingConfig.set(false);
          this.toast.success('Config saved');
        },
        error: () => {
          this.savingConfig.set(false);
          this.toast.error('Failed to save config');
        },
      });
  }

  saveSections(): void {
    this.savingSections.set(true);
    this.admin
      .updateSections(this.sections())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savingSections.set(false);
          this.toast.success('Sections saved');
        },
        error: () => {
          this.savingSections.set(false);
          this.toast.error('Failed to save sections');
        },
      });
  }

  private detectType(key: string, value: string): ConfigEntry['type'] {
    if (key.includes('color')) return 'color';
    if (key.includes('url') || value.startsWith('http')) return 'url';
    if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
    return 'text';
  }
}
