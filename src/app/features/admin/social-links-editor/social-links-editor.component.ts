import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { GenericCrudComponent } from '../../../shared/components/generic-crud/generic-crud.component';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';
import type { SocialLink } from '../../../core/domain/entities';

@Component({
  selector: 'app-social-links-editor',
  standalone: true,
  imports: [ReactiveFormsModule, GenericCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-generic-crud
      title="Social Links"
      entityLabel="Social Link"
      [resource]="resource"
      [columns]="columns"
      [form]="form"
      [toFormValue]="toFormValue"
      [initialFormState]="initialFormState"
    >
      <div [formGroup]="form" class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs text-white/50">Platform *</label>
          <input
            formControlName="platform"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            placeholder="GitHub, LinkedIn, Twitter..."
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-white/50">URL *</label>
          <input
            formControlName="url"
            type="url"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-white/50">Icon Slug</label>
          <input
            formControlName="icon_slug"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            placeholder="github, linkedin, etc."
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-white/50">Sort Order</label>
          <input
            formControlName="sort_order"
            type="number"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>
    </app-generic-crud>
  `,
})
export class SocialLinksEditorComponent {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

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

  readonly initialFormState = { sort_order: 0 };

  readonly resource: CrudResource<SocialLink> = {
    list: () => this.admin.getSocialLinks(),
    create: (dto) => this.admin.createSocialLink(dto),
    update: (id, dto) => this.admin.updateSocialLink(id, dto),
    delete: (id) => this.admin.deleteSocialLink(id),
  };

  readonly toFormValue = (s: SocialLink): Record<string, unknown> => ({
    platform: s.platform,
    url: s.url,
    icon_slug: s.icon_slug,
    sort_order: s.sort_order,
  });
}
