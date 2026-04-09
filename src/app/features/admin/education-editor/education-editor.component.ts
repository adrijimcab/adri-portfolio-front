import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, type Observable } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { GenericCrudComponent } from '../../../shared/components/generic-crud/generic-crud.component';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';
import type { Education } from '../../../core/domain/entities';

@Component({
  selector: 'app-education-editor',
  standalone: true,
  imports: [ReactiveFormsModule, GenericCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-generic-crud
      title="Education"
      entityLabel="Education"
      [resource]="resource"
      [columns]="columns"
      [form]="form"
      [toFormValue]="toFormValue"
    >
      <div [formGroup]="form" class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="edu-institution" class="mb-1 block text-xs text-white/50">Institution *</label>
            <input
              id="edu-institution"
              formControlName="institution"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="edu-degree" class="mb-1 block text-xs text-white/50">Degree *</label>
            <input
              id="edu-degree"
              formControlName="degree"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="edu-degree-en" class="mb-1 block text-xs text-white/50">Degree (EN)</label>
            <input
              id="edu-degree-en"
              formControlName="degree_en"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="edu-field" class="mb-1 block text-xs text-white/50">Field</label>
            <input
              id="edu-field"
              formControlName="field"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="edu-field-en" class="mb-1 block text-xs text-white/50">Field (EN)</label>
            <input
              id="edu-field-en"
              formControlName="field_en"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="edu-year-start" class="mb-1 block text-xs text-white/50">Year Start</label>
            <input
              id="edu-year-start"
              formControlName="year_start"
              type="number"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="edu-year-end" class="mb-1 block text-xs text-white/50">Year End</label>
            <input
              id="edu-year-end"
              formControlName="year_end"
              type="number"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
        <div>
          <label for="edu-description" class="mb-1 block text-xs text-white/50">Description</label>
          <textarea
            id="edu-description"
            formControlName="description"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
        <div>
          <label for="edu-description-en" class="mb-1 block text-xs text-white/50">Description (EN)</label>
          <textarea
            id="edu-description-en"
            formControlName="description_en"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
      </div>
    </app-generic-crud>
  `,
})
export class EducationEditorComponent {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

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

  readonly resource: CrudResource<Education> = {
    list: (): Observable<Education[]> =>
      this.admin.getEducation().pipe(
        // API may return { education: [...], courses: [...] } or a raw array
        map((res: unknown) =>
          Array.isArray(res)
            ? (res as Education[])
            : ((res as { education?: Education[] }).education ?? []),
        ),
      ),
    create: (dto) => this.admin.createEducation(dto),
    update: (id, dto) => this.admin.updateEducation(id, dto),
    delete: (id) => this.admin.deleteEducation(id),
  };

  readonly toFormValue = (e: Education): Record<string, unknown> => {
    const extra = e as Education & Record<string, unknown>;
    return {
      institution: e.institution,
      degree: e.degree,
      degree_en: (extra['degree_en'] as string) ?? '',
      field: e.field ?? '',
      field_en: (extra['field_en'] as string) ?? '',
      year_start: e.year_start,
      year_end: e.year_end,
      description: e.description ?? '',
      description_en: (extra['description_en'] as string) ?? '',
    };
  };
}
