import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { Experience } from '../../../core/models';

@Component({
  selector: 'app-experiences-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">Experiences</h1>

      @if (!editing()) {
        <app-data-table
          [columns]="columns"
          [data]="tableData()"
          (onAdd)="startAdd()"
          (onEdit)="startEdit($event)"
          (onDelete)="confirmDelete($event)"
        />
      } @else {
        <form
          [formGroup]="form"
          (ngSubmit)="save()"
          class="space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">
              {{ editingId() ? 'Edit Experience' : 'New Experience' }}
            </h2>
            <button
              type="button"
              (click)="cancelEdit()"
              class="text-sm text-white/40 hover:text-white/60"
            >Cancel</button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-white/50">Company *</label>
              <input formControlName="company"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Client</label>
              <input formControlName="client"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Role *</label>
              <input formControlName="role"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Role (EN)</label>
              <input formControlName="role_en"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Start Date *</label>
              <input formControlName="start_date" type="date"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">End Date</label>
              <input formControlName="end_date" type="date"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div class="flex items-center gap-2">
              <input formControlName="is_current" type="checkbox" class="accent-indigo-500" />
              <label class="text-xs text-white/50">Currently working here</label>
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Sort Order</label>
              <input formControlName="sort_order" type="number"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs text-white/50">Description</label>
            <textarea formControlName="description" rows="3"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"></textarea>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/50">Description (EN)</label>
            <textarea formControlName="description_en" rows="3"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"></textarea>
          </div>

          <!-- Achievements -->
          <div>
            <label class="mb-2 block text-xs text-white/50">Achievements</label>
            @for (ach of achievements(); track $index) {
              <div class="mb-2 flex gap-2">
                <input
                  [value]="ach"
                  (input)="updateAchievement($index, $event)"
                  class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                />
                <button type="button" (click)="removeAchievement($index)"
                  class="rounded px-2 text-red-400 hover:bg-red-500/10">&times;</button>
              </div>
            }
            <button type="button" (click)="addAchievement()"
              class="text-xs text-indigo-400 hover:text-indigo-300">+ Add achievement</button>
          </div>

          <!-- Achievements EN -->
          <div>
            <label class="mb-2 block text-xs text-white/50">Achievements (EN)</label>
            @for (ach of achievementsEn(); track $index) {
              <div class="mb-2 flex gap-2">
                <input
                  [value]="ach"
                  (input)="updateAchievementEn($index, $event)"
                  class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                />
                <button type="button" (click)="removeAchievementEn($index)"
                  class="rounded px-2 text-red-400 hover:bg-red-500/10">&times;</button>
              </div>
            }
            <button type="button" (click)="addAchievementEn()"
              class="text-xs text-indigo-400 hover:text-indigo-300">+ Add achievement (EN)</button>
          </div>

          <!-- Technology IDs -->
          <div>
            <label class="mb-1 block text-xs text-white/50">Technology IDs (comma-separated)</label>
            <input formControlName="technology_ids"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="uuid1, uuid2, ..." />
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" (click)="cancelEdit()"
              class="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08]">Cancel</button>
            <button type="submit" [disabled]="saving()"
              class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50">
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ExperiencesEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly data = signal<Experience[]>([]);
  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly achievements = signal<string[]>([]);
  readonly achievementsEn = signal<string[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'company', label: 'Company' },
    { key: 'client', label: 'Client' },
    { key: 'role', label: 'Role' },
    { key: 'start_date', label: 'Start', type: 'date' },
    { key: 'is_current', label: 'Current', type: 'boolean' },
  ];

  readonly tableData = signal<Record<string, unknown>[]>([]);

  readonly form = this.fb.nonNullable.group({
    company: ['', Validators.required],
    client: [''],
    role: ['', Validators.required],
    role_en: [''],
    description: [''],
    description_en: [''],
    start_date: ['', Validators.required],
    end_date: [''],
    is_current: [false],
    sort_order: [0],
    technology_ids: [''],
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.admin.getExperiences().subscribe({
      next: (items) => {
        this.data.set(items);
        this.tableData.set(items as unknown as Record<string, unknown>[]);
      },
    });
  }

  startAdd(): void {
    this.form.reset({ is_current: false, sort_order: 0 });
    this.achievements.set([]);
    this.achievementsEn.set([]);
    this.editingId.set(null);
    this.editing.set(true);
  }

  startEdit(row: Record<string, unknown>): void {
    const exp = row as unknown as Experience & Record<string, unknown>;
    this.form.patchValue({
      company: exp.company,
      client: exp.client ?? '',
      role: exp.role,
      role_en: (exp['role_en'] as string) ?? '',
      description: exp.description ?? '',
      description_en: (exp['description_en'] as string) ?? '',
      start_date: exp.start_date,
      end_date: exp.end_date ?? '',
      is_current: exp.is_current,
      sort_order: exp.sort_order,
      technology_ids: exp.technologies?.map((t) => t.id).join(', ') ?? '',
    });
    this.achievements.set(exp.achievements ?? []);
    this.achievementsEn.set((exp['achievements_en'] as string[]) ?? []);
    this.editingId.set(exp.id);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      ...raw,
      achievements: this.achievements(),
      achievements_en: this.achievementsEn(),
      technology_ids: raw.technology_ids ? raw.technology_ids.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
    delete payload['technology_ids'];

    const id = this.editingId();
    const req = id
      ? this.admin.updateExperience(id, payload)
      : this.admin.createExperience(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.toast.success(id ? 'Experience updated' : 'Experience created');
        this.loadData();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to save experience');
      },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.confirm.confirm('Delete Experience', 'Are you sure you want to delete this experience?').subscribe({
      next: (confirmed) => {
        if (!confirmed) return;
        this.admin.deleteExperience(row['id'] as string).subscribe({
          next: () => { this.toast.success('Experience deleted'); this.loadData(); },
          error: () => this.toast.error('Failed to delete experience'),
        });
      },
    });
  }

  addAchievement(): void { this.achievements.update((a) => [...a, '']); }
  removeAchievement(i: number): void { this.achievements.update((a) => a.filter((_, idx) => idx !== i)); }
  updateAchievement(i: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.achievements.update((a) => a.map((v, idx) => (idx === i ? val : v)));
  }

  addAchievementEn(): void { this.achievementsEn.update((a) => [...a, '']); }
  removeAchievementEn(i: number): void { this.achievementsEn.update((a) => a.filter((_, idx) => idx !== i)); }
  updateAchievementEn(i: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.achievementsEn.update((a) => a.map((v, idx) => (idx === i ? val : v)));
  }
}
