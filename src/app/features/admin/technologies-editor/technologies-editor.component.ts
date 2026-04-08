import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { GenericCrudComponent } from '../../../shared/components/generic-crud/generic-crud.component';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';
import type { Technology } from '../../../core/domain/entities';

@Component({
  selector: 'app-technologies-editor',
  standalone: true,
  imports: [ReactiveFormsModule, GenericCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-generic-crud
      title="Technologies"
      entityLabel="Technology"
      [resource]="resource"
      [columns]="columns"
      [form]="form"
      [toFormValue]="toFormValue"
      [initialFormState]="initialFormState"
    >
      <div [formGroup]="form" class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs text-white/50">Name *</label>
          <input
            formControlName="name"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-white/50">Icon Slug *</label>
          <div class="flex items-center gap-3">
            <input
              formControlName="icon_slug"
              class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
              placeholder="angular, react, etc."
            />
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
          <select
            formControlName="category"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          >
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
          <input
            formControlName="proficiency_level"
            type="range"
            min="0"
            max="100"
            class="w-full accent-indigo-500"
          />
          <span class="text-xs text-white/40">{{ form.value.proficiency_level }}%</span>
        </div>
        <div class="flex items-center gap-2">
          <input formControlName="is_primary" type="checkbox" class="accent-indigo-500" />
          <label class="text-xs text-white/50">Primary Technology</label>
        </div>
      </div>
    </app-generic-crud>
  `,
})
export class TechnologiesEditorComponent {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

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

  readonly initialFormState = { proficiency_level: 50, is_primary: false };

  readonly resource: CrudResource<Technology> = {
    list: () => this.admin.getTechnologies(),
    create: (dto) => this.admin.createTechnology(dto),
    update: (id, dto) => this.admin.updateTechnology(id, dto),
    delete: (id) => this.admin.deleteTechnology(id),
  };

  readonly toFormValue = (t: Technology): Record<string, unknown> => ({
    name: t.name,
    icon_slug: t.icon_slug,
    category: t.category ?? '',
    proficiency_level: t.proficiency_level ?? 50,
    is_primary: t.is_primary ?? false,
  });

  onIconError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
