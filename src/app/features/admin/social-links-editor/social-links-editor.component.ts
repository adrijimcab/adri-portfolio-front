import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { SocialLink } from '../../../core/models';

@Component({
  selector: 'app-social-links-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">Social Links</h1>

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
            <h2 class="text-lg font-semibold text-white">{{ editingId() ? 'Edit' : 'New' }} Social Link</h2>
            <button type="button" (click)="editing.set(false)" class="text-sm text-white/40 hover:text-white/60">Cancel</button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-white/50">Platform *</label>
              <input formControlName="platform" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" placeholder="GitHub, LinkedIn, Twitter..." />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">URL *</label>
              <input formControlName="url" type="url" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Icon Slug</label>
              <input formControlName="icon_slug" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" placeholder="github, linkedin, etc." />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Sort Order</label>
              <input formControlName="sort_order" type="number" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
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
export class SocialLinksEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly tableData = signal<Record<string, unknown>[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'platform', label: 'Platform' },
    { key: 'url', label: 'URL' },
    { key: 'icon_slug', label: 'Icon' },
    { key: 'sort_order', label: 'Order', type: 'number' },
  ];

  readonly form = this.fb.nonNullable.group({
    platform: ['', Validators.required],
    url: ['', Validators.required],
    icon_slug: [''],
    sort_order: [0],
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.admin.getSocialLinks().subscribe({
      next: (items) => this.tableData.set(items as unknown as Record<string, unknown>[]),
    });
  }

  startAdd(): void { this.form.reset({ sort_order: 0 }); this.editingId.set(null); this.editing.set(true); }

  startEdit(row: Record<string, unknown>): void {
    const s = row as unknown as SocialLink;
    this.form.patchValue({
      platform: s.platform,
      url: s.url,
      icon_slug: s.icon_slug,
      sort_order: s.sort_order,
    });
    this.editingId.set(s.id);
    this.editing.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.admin.updateSocialLink(id, this.form.getRawValue())
      : this.admin.createSocialLink(this.form.getRawValue());
    req.subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.toast.success(id ? 'Updated' : 'Created'); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error('Failed to save'); },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.confirm.confirm('Delete Social Link', 'Are you sure?').subscribe({
      next: (ok) => {
        if (!ok) return;
        this.admin.deleteSocialLink(row['id'] as string).subscribe({
          next: () => { this.toast.success('Deleted'); this.loadData(); },
          error: () => this.toast.error('Failed to delete'),
        });
      },
    });
  }
}
