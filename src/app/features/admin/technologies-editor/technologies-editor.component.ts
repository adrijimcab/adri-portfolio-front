import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { Technology } from '../../../core/models';

@Component({
  selector: 'app-technologies-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">Technologies</h1>

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
              {{ editingId() ? 'Edit Technology' : 'New Technology' }}
            </h2>
            <button type="button" (click)="editing.set(false)" class="text-sm text-white/40 hover:text-white/60">Cancel</button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-white/50">Name *</label>
              <input formControlName="name" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Icon Slug *</label>
              <div class="flex items-center gap-3">
                <input formControlName="icon_slug" class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" placeholder="angular, react, etc." />
                @if (form.value.icon_slug) {
                  <img
                    [src]="'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/' + form.value.icon_slug + '/' + form.value.icon_slug + '-original.svg'"
                    alt="icon preview"
                    class="h-8 w-8"
                    (error)="onIconError($event)"
                  />
                }
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Category</label>
              <select formControlName="category" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50">
                <option value="">Select...</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="devops">DevOps</option>
                <option value="tools">Tools</option>
                <option value="mobile">Mobile</option>
                <option value="testing">Testing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Proficiency (0-100)</label>
              <input formControlName="proficiency_level" type="range" min="0" max="100" class="w-full accent-indigo-500" />
              <span class="text-xs text-white/40">{{ form.value.proficiency_level }}%</span>
            </div>
            <div class="flex items-center gap-2">
              <input formControlName="is_primary" type="checkbox" class="accent-indigo-500" />
              <label class="text-xs text-white/50">Primary Technology</label>
            </div>
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
export class TechnologiesEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly tableData = signal<Record<string, unknown>[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'icon_slug', label: 'Icon Slug' },
    { key: 'category', label: 'Category' },
    { key: 'proficiency_level', label: 'Proficiency', type: 'number' },
    { key: 'is_primary', label: 'Primary', type: 'boolean' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    icon_slug: ['', Validators.required],
    category: [''],
    proficiency_level: [50],
    is_primary: [false],
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.admin.getTechnologies().subscribe({
      next: (items) => this.tableData.set(items as unknown as Record<string, unknown>[]),
    });
  }

  startAdd(): void {
    this.form.reset({ proficiency_level: 50, is_primary: false });
    this.editingId.set(null);
    this.editing.set(true);
  }

  startEdit(row: Record<string, unknown>): void {
    const t = row as unknown as Technology;
    this.form.patchValue({
      name: t.name,
      icon_slug: t.icon_slug,
      category: t.category ?? '',
      proficiency_level: t.proficiency_level ?? 50,
      is_primary: t.is_primary ?? false,
    });
    this.editingId.set(t.id);
    this.editing.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.admin.updateTechnology(id, this.form.getRawValue())
      : this.admin.createTechnology(this.form.getRawValue());
    req.subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.toast.success(id ? 'Updated' : 'Created'); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error('Failed to save'); },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.confirm.confirm('Delete Technology', 'Are you sure?').subscribe({
      next: (ok) => {
        if (!ok) return;
        this.admin.deleteTechnology(row['id'] as string).subscribe({
          next: () => { this.toast.success('Deleted'); this.loadData(); },
          error: () => this.toast.error('Failed to delete'),
        });
      },
    });
  }

  onIconError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
