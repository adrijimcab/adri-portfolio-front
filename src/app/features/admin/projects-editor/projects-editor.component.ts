import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { GenericCrudComponent } from '../../../shared/components/generic-crud/generic-crud.component';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';
import type { Project } from '../../../core/domain/entities';

@Component({
  selector: 'app-projects-editor',
  standalone: true,
  imports: [ReactiveFormsModule, GenericCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-generic-crud
      title="Projects"
      entityLabel="Project"
      [resource]="resource"
      [columns]="columns"
      [form]="form"
      [toFormValue]="toFormValue"
      [initialFormState]="initialFormState"
      [augmentPayload]="augmentPayload"
    >
      <div [formGroup]="form" class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="proj-title" class="mb-1 block text-xs text-white/50">Title *</label>
            <input
              id="proj-title"
              formControlName="title"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-slug" class="mb-1 block text-xs text-white/50">Slug *</label>
            <input
              id="proj-slug"
              formControlName="slug"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-title-en" class="mb-1 block text-xs text-white/50">Title (EN)</label>
            <input
              id="proj-title-en"
              formControlName="title_en"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div class="flex items-center gap-2">
            <input id="proj-featured" formControlName="is_featured" type="checkbox" class="accent-indigo-500" />
            <label for="proj-featured" class="text-xs text-white/50">Featured</label>
          </div>
          <div>
            <label for="proj-image-url" class="mb-1 block text-xs text-white/50">Image URL</label>
            <input
              id="proj-image-url"
              formControlName="image_url"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-demo-url" class="mb-1 block text-xs text-white/50">Demo URL</label>
            <input
              id="proj-demo-url"
              formControlName="demo_url"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-repo-url" class="mb-1 block text-xs text-white/50">Repo URL</label>
            <input
              id="proj-repo-url"
              formControlName="repo_url"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-sort-order" class="mb-1 block text-xs text-white/50">Sort Order</label>
            <input
              id="proj-sort-order"
              formControlName="sort_order"
              type="number"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-start-date" class="mb-1 block text-xs text-white/50">Start Date</label>
            <input
              id="proj-start-date"
              formControlName="start_date"
              type="date"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="proj-end-date" class="mb-1 block text-xs text-white/50">End Date</label>
            <input
              id="proj-end-date"
              formControlName="end_date"
              type="date"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        @if (form.value.image_url) {
          <img
            [src]="form.value.image_url"
            alt="Preview"
            class="h-32 rounded-lg border border-white/10 object-cover"
          />
        }

        <div>
          <label for="proj-short-desc" class="mb-1 block text-xs text-white/50">Short Description</label>
          <input
            id="proj-short-desc"
            formControlName="short_description"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label for="proj-description" class="mb-1 block text-xs text-white/50">Description</label>
          <textarea
            id="proj-description"
            formControlName="description"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
        <div>
          <label for="proj-description-en" class="mb-1 block text-xs text-white/50">Description (EN)</label>
          <textarea
            id="proj-description-en"
            formControlName="description_en"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
        <div>
          <label for="proj-tech-ids" class="mb-1 block text-xs text-white/50">
            Technology IDs (comma-separated)
          </label>
          <input
            id="proj-tech-ids"
            formControlName="technology_ids"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            placeholder="uuid1, uuid2, ..."
          />
        </div>
      </div>
    </app-generic-crud>
  `,
})
export class ProjectsEditorComponent {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

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

  readonly initialFormState = { is_featured: false, sort_order: 0 };

  readonly resource: CrudResource<Project> = {
    list: () => this.admin.getProjects(),
    create: (dto) => this.admin.createProject(dto),
    update: (id, dto) => this.admin.updateProject(id, dto),
    delete: (id) => this.admin.deleteProject(id),
  };

  readonly toFormValue = (p: Project): Record<string, unknown> => {
    const extra = p as Project & Record<string, unknown>;
    return {
      title: p.title,
      title_en: (extra['title_en'] as string) ?? '',
      slug: p.slug,
      description: p.description ?? '',
      description_en: (extra['description_en'] as string) ?? '',
      short_description: p.short_description ?? '',
      image_url: p.image_url ?? '',
      demo_url: p.demo_url ?? '',
      repo_url: p.repo_url ?? '',
      is_featured: p.is_featured,
      sort_order: p.sort_order,
      start_date: (extra['start_date'] as string) ?? '',
      end_date: (extra['end_date'] as string) ?? '',
      technology_ids: p.technologies?.map((t) => t.id).join(', ') ?? '',
    };
  };

  readonly augmentPayload = (payload: Partial<Project>): Partial<Project> => {
    const raw = payload as Partial<Project> & Record<string, unknown>;
    const techRaw = (raw['technology_ids'] as string | undefined) ?? '';
    const technology_ids = techRaw
      ? techRaw
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
    const out: Record<string, unknown> = { ...raw, technology_ids };
    return out as unknown as Partial<Project>;
  };
}
