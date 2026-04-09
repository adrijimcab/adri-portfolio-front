import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { GenericCrudComponent } from '../../../shared/components/generic-crud/generic-crud.component';
import type { TableColumn } from '../../../shared/components/data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';
import type { Experience } from '../../../core/domain/entities';

@Component({
  selector: 'app-experiences-editor',
  standalone: true,
  imports: [ReactiveFormsModule, GenericCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-generic-crud
      title="Experiences"
      entityLabel="Experience"
      [resource]="resource"
      [columns]="columns"
      [form]="form"
      [toFormValue]="toFormValue"
      [initialFormState]="initialFormState"
      [onBeforeAdd]="resetAchievements"
      [onBeforeEdit]="hydrateAchievements"
      [augmentPayload]="augmentPayload"
    >
      <div [formGroup]="form" class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="exp-company" class="mb-1 block text-xs text-white/50">Company *</label>
            <input
              id="exp-company"
              formControlName="company"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="exp-client" class="mb-1 block text-xs text-white/50">Client</label>
            <input
              id="exp-client"
              formControlName="client"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="exp-role" class="mb-1 block text-xs text-white/50">Role *</label>
            <input
              id="exp-role"
              formControlName="role"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="exp-role-en" class="mb-1 block text-xs text-white/50">Role (EN)</label>
            <input
              id="exp-role-en"
              formControlName="role_en"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="exp-start-date" class="mb-1 block text-xs text-white/50">Start Date *</label>
            <input
              id="exp-start-date"
              formControlName="start_date"
              type="date"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label for="exp-end-date" class="mb-1 block text-xs text-white/50">End Date</label>
            <input
              id="exp-end-date"
              formControlName="end_date"
              type="date"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
          <div class="flex items-center gap-2">
            <input id="exp-is-current" formControlName="is_current" type="checkbox" class="accent-indigo-500" />
            <label for="exp-is-current" class="text-xs text-white/50">Currently working here</label>
          </div>
          <div>
            <label for="exp-sort-order" class="mb-1 block text-xs text-white/50">Sort Order</label>
            <input
              id="exp-sort-order"
              formControlName="sort_order"
              type="number"
              class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div>
          <label for="exp-description" class="mb-1 block text-xs text-white/50">Description</label>
          <textarea
            id="exp-description"
            formControlName="description"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>
        <div>
          <label for="exp-description-en" class="mb-1 block text-xs text-white/50">Description (EN)</label>
          <textarea
            id="exp-description-en"
            formControlName="description_en"
            rows="3"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
          ></textarea>
        </div>

        <div role="group" aria-labelledby="exp-achievements-label">
          <span id="exp-achievements-label" class="mb-2 block text-xs text-white/50">Achievements</span>
          @for (ach of achievements(); track $index) {
            <div class="mb-2 flex gap-2">
              <input
                [value]="ach"
                (input)="updateAchievement($index, $event)"
                class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <button
                type="button"
                (click)="removeAchievement($index)"
                class="rounded px-2 text-red-400 hover:bg-red-500/10"
              >
                &times;
              </button>
            </div>
          }
          <button
            type="button"
            (click)="addAchievement()"
            class="text-xs text-indigo-400 hover:text-indigo-300"
          >
            + Add achievement
          </button>
        </div>

        <div role="group" aria-labelledby="exp-achievements-en-label">
          <span id="exp-achievements-en-label" class="mb-2 block text-xs text-white/50">Achievements (EN)</span>
          @for (ach of achievementsEn(); track $index) {
            <div class="mb-2 flex gap-2">
              <input
                [value]="ach"
                (input)="updateAchievementEn($index, $event)"
                class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <button
                type="button"
                (click)="removeAchievementEn($index)"
                class="rounded px-2 text-red-400 hover:bg-red-500/10"
              >
                &times;
              </button>
            </div>
          }
          <button
            type="button"
            (click)="addAchievementEn()"
            class="text-xs text-indigo-400 hover:text-indigo-300"
          >
            + Add achievement (EN)
          </button>
        </div>

        <div>
          <label for="exp-tech-ids" class="mb-1 block text-xs text-white/50"
            >Technology IDs (comma-separated)</label
          >
          <input
            id="exp-tech-ids"
            formControlName="technology_ids"
            class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
            placeholder="uuid1, uuid2, ..."
          />
        </div>
      </div>
    </app-generic-crud>
  `,
})
export class ExperiencesEditorComponent {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  readonly achievements = signal<string[]>([]);
  readonly achievementsEn = signal<string[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'company', label: 'Company' },
    { key: 'client', label: 'Client' },
    { key: 'role', label: 'Role' },
    { key: 'start_date', label: 'Start', type: 'date' },
    { key: 'is_current', label: 'Current', type: 'boolean' },
  ];

  readonly form = this.fb.nonNullable.group({
    company: ['', Validators.required],
    client: [''],
    role: ['', Validators.required],
    role_en: [''],
    description: [''],
    description_en: [''],
    start_date: ['', Validators.required],
    end_date: [''],
    is_current: [false],
    sort_order: [0],
    technology_ids: [''],
  });

  readonly initialFormState = { is_current: false, sort_order: 0 };

  readonly resource: CrudResource<Experience> = {
    list: () => this.admin.getExperiences(),
    create: (dto) => this.admin.createExperience(dto),
    update: (id, dto) => this.admin.updateExperience(id, dto),
    delete: (id) => this.admin.deleteExperience(id),
  };

  readonly toFormValue = (exp: Experience): Record<string, unknown> => {
    const extra = exp as Experience & Record<string, unknown>;
    return {
      company: exp.company,
      client: exp.client ?? '',
      role: exp.role,
      role_en: (extra['role_en'] as string) ?? '',
      description: exp.description ?? '',
      description_en: (extra['description_en'] as string) ?? '',
      start_date: exp.start_date,
      end_date: exp.end_date ?? '',
      is_current: exp.is_current,
      sort_order: exp.sort_order,
      technology_ids: exp.technologies?.map((t) => t.id).join(', ') ?? '',
    };
  };

  readonly resetAchievements = (): void => {
    this.achievements.set([]);
    this.achievementsEn.set([]);
  };

  readonly hydrateAchievements = (row: unknown): void => {
    const exp = row as Experience & Record<string, unknown>;
    this.achievements.set(exp.achievements ?? []);
    this.achievementsEn.set((exp['achievements_en'] as string[]) ?? []);
  };

  readonly augmentPayload = (payload: Partial<Experience>): Partial<Experience> => {
    const raw = payload as Partial<Experience> & Record<string, unknown>;
    const techRaw = (raw['technology_ids'] as string | undefined) ?? '';
    const technology_ids = techRaw
      ? techRaw
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    const out: Record<string, unknown> = {
      ...raw,
      achievements: this.achievements(),
      achievements_en: this.achievementsEn(),
      technology_ids,
    };
    return out as unknown as Partial<Experience>;
  };

  addAchievement(): void {
    this.achievements.update((a) => [...a, '']);
  }
  removeAchievement(i: number): void {
    this.achievements.update((a) => a.filter((_, idx) => idx !== i));
  }
  updateAchievement(i: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.achievements.update((a) => a.map((v, idx) => (idx === i ? val : v)));
  }

  addAchievementEn(): void {
    this.achievementsEn.update((a) => [...a, '']);
  }
  removeAchievementEn(i: number): void {
    this.achievementsEn.update((a) => a.filter((_, idx) => idx !== i));
  }
  updateAchievementEn(i: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.achievementsEn.update((a) => a.map((v, idx) => (idx === i ? val : v)));
  }
}
