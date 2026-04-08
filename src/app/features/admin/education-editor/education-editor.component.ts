import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import type { Education } from '../../../core/models';

@Component({
  selector: 'app-education-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">Education</h1>

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
            <h2 class="text-lg font-semibold text-white">{{ editingId() ? 'Edit' : 'New' }} Education</h2>
            <button type="button" (click)="editing.set(false)" class="text-sm text-white/40 hover:text-white/60">Cancel</button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-white/50">Institution *</label>
              <input formControlName="institution" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Degree *</label>
              <input formControlName="degree" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Degree (EN)</label>
              <input formControlName="degree_en" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Field</label>
              <input formControlName="field" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Field (EN)</label>
              <input formControlName="field_en" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Year Start</label>
              <input formControlName="year_start" type="number" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Year End</label>
              <input formControlName="year_end" type="number" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/50">Description</label>
            <textarea formControlName="description" rows="3" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"></textarea>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/50">Description (EN)</label>
            <textarea formControlName="description_en" rows="3" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" (click)="editing.set(false)" class="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08]">Cancel</button>
            <button type="submit" [disabled]="saving()" class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class EducationEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly tableData = signal<Record<string, unknown>[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'institution', label: 'Institution' },
    { key: 'degree', label: 'Degree' },
    { key: 'field', label: 'Field' },
    { key: 'year_start', label: 'Start', type: 'number' },
    { key: 'year_end', label: 'End', type: 'number' },
  ];

  readonly form = this.fb.nonNullable.group({
    institution: ['', Validators.required],
    degree: ['', Validators.required],
    degree_en: [''],
    field: [''],
    field_en: [''],
    year_start: [null as number | null],
    year_end: [null as number | null],
    description: [''],
    description_en: [''],
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.admin.getEducation().subscribe({
      next: (res) => {
        // API returns { education: [...], courses: [...] } or just array
        const items = Array.isArray(res) ? res : (res as unknown as { education: Education[] }).education ?? [];
        this.tableData.set(items as unknown as Record<string, unknown>[]);
      },
    });
  }

  startAdd(): void {
    this.form.reset();
    this.editingId.set(null);
    this.editing.set(true);
  }

  startEdit(row: Record<string, unknown>): void {
    const e = row as unknown as Education & Record<string, unknown>;
    this.form.patchValue({
      institution: e.institution,
      degree: e.degree,
      degree_en: (e['degree_en'] as string) ?? '',
      field: e.field ?? '',
      field_en: (e['field_en'] as string) ?? '',
      year_start: e.year_start,
      year_end: e.year_end,
      description: e.description ?? '',
      description_en: (e['description_en'] as string) ?? '',
    });
    this.editingId.set(e.id);
    this.editing.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.admin.updateEducation(id, this.form.getRawValue() as Partial<Education>)
      : this.admin.createEducation(this.form.getRawValue() as Partial<Education>);
    req.subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.toast.success(id ? 'Updated' : 'Created'); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error('Failed to save'); },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.confirm.confirm('Delete Education', 'Are you sure?').subscribe({
      next: (ok) => {
        if (!ok) return;
        this.admin.deleteEducation(row['id'] as string).subscribe({
          next: () => { this.toast.success('Deleted'); this.loadData(); },
          error: () => this.toast.error('Failed to delete'),
        });
      },
    });
  }
}
