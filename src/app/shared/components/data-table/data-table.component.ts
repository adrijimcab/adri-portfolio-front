import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'boolean' | 'date' | 'number';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Search -->
      <div class="flex items-center justify-between gap-4">
        <input
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          placeholder="Search..."
          aria-label="Buscar en la tabla"
          class="w-full max-w-xs rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
        />
        <button
          (click)="rowAdd.emit()"
          class="shrink-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600"
        >
          + Add
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table class="w-full text-left text-sm">
          <caption class="sr-only">
            Data table
          </caption>
          <thead>
            <tr class="border-b border-white/[0.06] bg-white/[0.02]">
              @for (col of columns(); track col.key) {
                <th
                  class="cursor-pointer px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase select-none"
                  (click)="toggleSort(col.key)"
                  [attr.aria-label]="'Sort by ' + col.label"
                  [attr.aria-sort]="
                    sortKey() === col.key
                      ? sortDir() === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : null
                  "
                >
                  {{ col.label }}
                  @if (sortKey() === col.key) {
                    <span aria-hidden="true">{{ sortDir() === 'asc' ? ' ↑' : ' ↓' }}</span>
                  }
                </th>
              }
              <th class="px-4 py-3 text-xs font-medium tracking-wider text-white/40 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (row of filteredData(); track $index) {
              <tr class="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                @for (col of columns(); track col.key) {
                  <td class="px-4 py-3 text-white/80">
                    @switch (col.type) {
                      @case ('boolean') {
                        <span
                          class="inline-block h-2 w-2 rounded-full"
                          [class]="getCellValue(row, col.key) ? 'bg-green-400' : 'bg-white/20'"
                        ></span>
                      }
                      @case ('date') {
                        {{ formatDate(getCellValue(row, col.key)) }}
                      }
                      @default {
                        {{ getCellValue(row, col.key) ?? '-' }}
                      }
                    }
                  </td>
                }
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      (click)="rowEdit.emit(row)"
                      class="rounded px-3 py-2 text-xs text-indigo-400 transition-colors hover:bg-indigo-500/10"
                    >
                      Edit
                    </button>
                    <button
                      (click)="rowDelete.emit(row)"
                      class="rounded px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td
                  [attr.colspan]="columns().length + 1"
                  class="px-4 py-8 text-center text-white/30"
                  role="status"
                  aria-live="polite"
                >
                  No data found.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DataTableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<Record<string, unknown>[]>();

  readonly rowEdit = output<Record<string, unknown>>();
  readonly rowDelete = output<Record<string, unknown>>();
  readonly rowAdd = output();

  readonly searchTerm = signal('');
  readonly sortKey = signal('');
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly filteredData = computed(() => {
    let items = [...this.data()];
    const term = this.searchTerm().toLowerCase();

    if (term) {
      items = items.filter((row) =>
        this.columns().some((col) => {
          const val = this.getCellValue(row, col.key);
          return val != null && this.stringify(val).toLowerCase().includes(term);
        }),
      );
    }

    const key = this.sortKey();
    if (key) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        const aVal = this.getCellValue(a, key);
        const bVal = this.getCellValue(b, key);
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        return this.stringify(aVal).localeCompare(this.stringify(bVal)) * dir;
      });
    }

    return items;
  });

  toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  getCellValue(row: Record<string, unknown>, key: string): unknown {
    return row[key];
  }

  formatDate(value: unknown): string {
    if (!value) return '-';
    const str = this.stringify(value);
    try {
      return new Date(str).toLocaleDateString();
    } catch {
      return str;
    }
  }

  /** Type-safe stringification for unknown cell values. */
  private stringify(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value == null) return '';
    return JSON.stringify(value);
  }
}
