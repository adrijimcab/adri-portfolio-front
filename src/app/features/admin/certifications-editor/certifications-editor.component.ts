import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { GenericCrudComponent } from '../../../shared/components/generic-crud/generic-crud.component';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';
import type { Certification } from '../../../core/domain/entities';

@Component({
  selector: 'app-certifications-editor',
  standalone: true,
  imports: [ReactiveFormsModule, GenericCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-generic-crud
      title="Certifications"
      entityLabel="Certification"
      [resource]="resource"
      [columns]="columns"
      [form]="form"
      [toFormValue]="toFormValue"
      [initialFormState]="initialFormState"
    >
      <div [formGroup]="form" class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="cert-name" class="mb-1 block text-xs text-white/50">Name *</label>
            <input
              id="cert-name"
              formControlName="name"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="cert-provider" class="mb-1 block text-xs text-white/50">Provider *</label>
            <input
              id="cert-provider"
              formControlName="provider"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="cert-date" class="mb-1 block text-xs text-white/50">Date</label>
            <input
              id="cert-date"
              formControlName="date"
              type="date"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="cert-credential-id" class="mb-1 block text-xs text-white/50">Credential ID</label>
            <input
              id="cert-credential-id"
              formControlName="credential_id"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div class="md:col-span-2">
            <label for="cert-url" class="mb-1 block text-xs text-white/50">Certificate URL</label>
            <input
              id="cert-url"
              formControlName="certificate_url"
              type="url"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
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
            <input id="cert-verified" formControlName="is_verified" type="checkbox" class="accent-indigo-500" />
            <label for="cert-verified" class="text-xs text-white/50">Verified</label>
          </div>
          <div>
            <label for="cert-sort-order" class="mb-1 block text-xs text-white/50">Sort Order</label>
            <input
              id="cert-sort-order"
              formControlName="sort_order"
              type="number"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
        <div>
          <label for="cert-description" class="mb-1 block text-xs text-white/50">Description</label>
          <textarea
            id="cert-description"
            formControlName="description"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
        <div>
          <label for="cert-description-en" class="mb-1 block text-xs text-white/50">Description (EN)</label>
          <textarea
            id="cert-description-en"
            formControlName="description_en"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
      </div>
    </app-generic-crud>
  `,
})
export class CertificationsEditorComponent {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

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

  readonly initialFormState = { is_verified: false, sort_order: 0 };

  readonly resource: CrudResource<Certification> = {
    list: () => this.admin.getCertifications(),
    create: (dto) => this.admin.createCertification(dto),
    update: (id, dto) => this.admin.updateCertification(id, dto),
    delete: (id) => this.admin.deleteCertification(id),
  };

  readonly toFormValue = (c: Certification): Record<string, unknown> => {
    const extra = c as Certification & Record<string, unknown>;
    return {
      name: c.name,
      provider: c.provider,
      date: c.date ?? '',
      certificate_url: c.certificate_url ?? '',
      credential_id: c.credential_id ?? '',
      is_verified: c.is_verified,
      description: c.description ?? '',
      description_en: (extra['description_en'] as string) ?? '',
      sort_order: c.sort_order,
    };
  };
}
