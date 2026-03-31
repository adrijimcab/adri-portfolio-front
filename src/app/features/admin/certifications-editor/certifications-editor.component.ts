import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { Certification } from '../../../core/models';

@Component({
  selector: 'app-certifications-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">Certifications</h1>

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
            <h2 class="text-lg font-semibold text-white">{{ editingId() ? 'Edit' : 'New' }} Certification</h2>
            <button type="button" (click)="editing.set(false)" class="text-sm text-white/40 hover:text-white/60">Cancel</button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-white/50">Name *</label>
              <input formControlName="name" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Provider *</label>
              <input formControlName="provider" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Date</label>
              <input formControlName="date" type="date" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Credential ID</label>
              <input formControlName="credential_id" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1 block text-xs text-white/50">Certificate URL</label>
              <input formControlName="certificate_url" type="url" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            @if (form.value.certificate_url) {
              <div class="md:col-span-2">
                <iframe
                  [src]="form.value.certificate_url"
                  class="h-48 w-full rounded-lg border border-white/10"
                  title="Certificate preview"
                ></iframe>
              </div>
            }
            <div class="flex items-center gap-2">
              <input formControlName="is_verified" type="checkbox" class="accent-indigo-500" />
              <label class="text-xs text-white/50">Verified</label>
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Sort Order</label>
              <input formControlName="sort_order" type="number" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
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
export class CertificationsEditorComponent implements OnInit {
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
    { key: 'provider', label: 'Provider' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'is_verified', label: 'Verified', type: 'boolean' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    provider: ['', Validators.required],
    date: [''],
    certificate_url: [''],
    credential_id: [''],
    is_verified: [false],
    description: [''],
    description_en: [''],
    sort_order: [0],
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.admin.getCertifications().subscribe({
      next: (items) => this.tableData.set(items as unknown as Record<string, unknown>[]),
    });
  }

  startAdd(): void { this.form.reset({ is_verified: false, sort_order: 0 }); this.editingId.set(null); this.editing.set(true); }

  startEdit(row: Record<string, unknown>): void {
    const c = row as unknown as Certification & Record<string, unknown>;
    this.form.patchValue({
      name: c.name,
      provider: c.provider,
      date: c.date ?? '',
      certificate_url: c.certificate_url ?? '',
      credential_id: c.credential_id ?? '',
      is_verified: c.is_verified,
      description: c.description ?? '',
      description_en: (c['description_en'] as string) ?? '',
      sort_order: c.sort_order,
    });
    this.editingId.set(c.id);
    this.editing.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.admin.updateCertification(id, this.form.getRawValue())
      : this.admin.createCertification(this.form.getRawValue());
    req.subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.toast.success(id ? 'Updated' : 'Created'); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error('Failed to save'); },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.confirm.confirm('Delete Certification', 'Are you sure?').subscribe({
      next: (ok) => {
        if (!ok) return;
        this.admin.deleteCertification(row['id'] as string).subscribe({
          next: () => { this.toast.success('Deleted'); this.loadData(); },
          error: () => this.toast.error('Failed to delete'),
        });
      },
    });
  }
}
