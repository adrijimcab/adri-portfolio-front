import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { Project } from '../../../core/models';

@Component({
  selector: 'app-projects-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">Projects</h1>

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
              {{ editingId() ? 'Edit Project' : 'New Project' }}
            </h2>
            <button type="button" (click)="editing.set(false)" class="text-sm text-white/40 hover:text-white/60">Cancel</button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-white/50">Title *</label>
              <input formControlName="title" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Slug *</label>
              <input formControlName="slug" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Title (EN)</label>
              <input formControlName="title_en" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div class="flex items-center gap-2">
              <input formControlName="is_featured" type="checkbox" class="accent-indigo-500" />
              <label class="text-xs text-white/50">Featured</label>
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Image URL</label>
              <input formControlName="image_url" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Demo URL</label>
              <input formControlName="demo_url" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Repo URL</label>
              <input formControlName="repo_url" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Sort Order</label>
              <input formControlName="sort_order" type="number" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">Start Date</label>
              <input formControlName="start_date" type="date" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-white/50">End Date</label>
              <input formControlName="end_date" type="date" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          @if (form.value.image_url) {
            <img [src]="form.value.image_url" alt="Preview" class="h-32 rounded-lg border border-white/10 object-cover" />
          }

          <div>
            <label class="mb-1 block text-xs text-white/50">Short Description</label>
            <input formControlName="short_description" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/50">Description</label>
            <textarea formControlName="description" rows="3" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"></textarea>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/50">Description (EN)</label>
            <textarea formControlName="description_en" rows="3" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"></textarea>
          </div>
          <div>
            <label class="mb-1 block text-xs text-white/50">Technology IDs (comma-separated)</label>
            <input formControlName="technology_ids" class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" placeholder="uuid1, uuid2, ..." />
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
export class ProjectsEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);

  readonly data = signal<Project[]>([]);
  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly tableData = signal<Record<string, unknown>[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    { key: 'is_featured', label: 'Featured', type: 'boolean' },
    { key: 'sort_order', label: 'Order', type: 'number' },
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    title_en: [''],
    slug: ['', Validators.required],
    description: [''],
    description_en: [''],
    short_description: [''],
    image_url: [''],
    demo_url: [''],
    repo_url: [''],
    is_featured: [false],
    sort_order: [0],
    start_date: [''],
    end_date: [''],
    technology_ids: [''],
  });

  ngOnInit(): void { this.loadData(); }

  private loadData(): void {
    this.admin.getProjects().subscribe({
      next: (items) => {
        this.data.set(items);
        this.tableData.set(items as unknown as Record<string, unknown>[]);
      },
    });
  }

  startAdd(): void {
    this.form.reset({ is_featured: false, sort_order: 0 });
    this.editingId.set(null);
    this.editing.set(true);
  }

  startEdit(row: Record<string, unknown>): void {
    const p = row as unknown as Project & Record<string, unknown>;
    this.form.patchValue({
      title: p.title,
      title_en: (p['title_en'] as string) ?? '',
      slug: p.slug,
      description: p.description ?? '',
      description_en: (p['description_en'] as string) ?? '',
      short_description: p.short_description ?? '',
      image_url: p.image_url ?? '',
      demo_url: p.demo_url ?? '',
      repo_url: p.repo_url ?? '',
      is_featured: p.is_featured,
      sort_order: p.sort_order,
      start_date: (p['start_date'] as string) ?? '',
      end_date: (p['end_date'] as string) ?? '',
      technology_ids: p.technologies?.map((t) => t.id).join(', ') ?? '',
    });
    this.editingId.set(p.id);
    this.editing.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      ...raw,
      technology_ids: raw.technology_ids ? raw.technology_ids.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
    delete payload['technology_ids'];

    const id = this.editingId();
    const req = id ? this.admin.updateProject(id, payload) : this.admin.createProject(payload);
    req.subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.toast.success(id ? 'Project updated' : 'Project created'); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error('Failed to save project'); },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    this.confirm.confirm('Delete Project', 'Are you sure?').subscribe({
      next: (ok) => {
        if (!ok) return;
        this.admin.deleteProject(row['id'] as string).subscribe({
          next: () => { this.toast.success('Project deleted'); this.loadData(); },
          error: () => this.toast.error('Failed to delete'),
        });
      },
    });
  }
}
