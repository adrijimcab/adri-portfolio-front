import type { OnInit } from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../toast/toast.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import type { TableColumn } from '../data-table/data-table.component';
import { DataTableComponent } from '../data-table/data-table.component';
import type { CrudResource } from '../../../core/domain/repositories';

/**
 * GenericCrudComponent — wraps the repeating admin CRUD pattern.
 *
 * Responsibilities:
 *  - fetch the list via {@link CrudResource.list}
 *  - render it through {@link DataTableComponent}
 *  - switch to a form view on add/edit, render a host-supplied form via
 *    content projection
 *  - handle create/update/delete with toast + confirm
 *  - clean up every subscription with `takeUntilDestroyed`
 *
 * Each editor supplies:
 *  - `resource`     → typed CRUD adapter (usually a tiny wrapper around AdminService)
 *  - `columns`      → DataTable column definitions
 *  - `form`         → a reactive FormGroup with the editor's fields
 *  - `toFormValue`  → maps a row to form values (called on edit)
 *  - `fromFormValue`→ maps raw form values to the create/update payload
 *  - `title`        → page title (e.g. "Experiences")
 *  - `entityLabel`  → singular label used in confirm dialog ("Experience")
 *
 * The form fields themselves are content-projected inside `[formGroup]`,
 * so each editor keeps full control over its own markup.
 */
@Component({
  selector: 'app-generic-crud',
  standalone: true,
  imports: [ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-white">{{ title() }}</h1>

      @if (!editing()) {
        <app-data-table
          [columns]="columns()"
          [data]="tableData()"
          (onAdd)="startAdd()"
          (onEdit)="startEdit($event)"
          (onDelete)="confirmDelete($event)"
        />
      } @else {
        <form
          [formGroup]="form()"
          (ngSubmit)="save()"
          class="space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">
              {{ editingId() ? 'Edit' : 'New' }} {{ entityLabel() }}
            </h2>
            <button
              type="button"
              (click)="cancelEdit()"
              class="text-sm text-white/40 hover:text-white/60"
            >
              Cancel
            </button>
          </div>

          <ng-content />

          <div class="flex justify-end gap-3">
            <button
              type="button"
              (click)="cancelEdit()"
              class="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="saving()"
              class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class GenericCrudComponent<T extends { id: string }> implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly title = input.required<string>();
  readonly entityLabel = input.required<string>();
  readonly resource = input.required<CrudResource<T>>();
  readonly columns = input.required<TableColumn[]>();
  readonly form = input.required<FormGroup>();

  /** Hydrates the form for an existing row. */
  readonly toFormValue = input.required<(row: T) => Record<string, unknown>>();

  /**
   * Converts the raw form value into the create/update payload.
   * Defaults to identity (the form value is the payload).
   */
  readonly fromFormValue = input<(raw: Record<string, unknown>) => Partial<T>>(
    (raw) => raw as Partial<T>,
  );

  /** Optional override for the initial reset state. */
  readonly initialFormState = input<Record<string, unknown> | undefined>(undefined);

  /**
   * Hook called before switching to the form view, after the form has
   * been reset/patched. Use it to sync host-owned state that lives
   * outside the FormGroup (e.g. signals for array fields).
   */
  readonly onBeforeAdd = input<() => void>(() => {
    /* noop */
  });
  readonly onBeforeEdit = input<(row: unknown) => void>(() => {
    /* noop */
  });

  /**
   * Hook that maps the create/update payload one more time, after
   * `fromFormValue`, so editors with host-owned state (e.g. achievements
   * signals) can merge it into the final DTO.
   */
  readonly augmentPayload = input<(payload: Partial<T>) => Partial<T>>((p) => p);

  readonly editing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly tableData = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.resource()
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.tableData.set(items as unknown as Record<string, unknown>[]),
      });
  }

  startAdd(): void {
    this.form().reset(this.initialFormState() ?? {});
    this.onBeforeAdd()();
    this.editingId.set(null);
    this.editing.set(true);
  }

  startEdit(row: Record<string, unknown>): void {
    const typed = row as unknown as T;
    this.form().reset(this.initialFormState() ?? {});
    this.form().patchValue(this.toFormValue()(typed));
    this.onBeforeEdit()(typed);
    this.editingId.set(typed.id);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.editingId.set(null);
  }

  save(): void {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = form.getRawValue() as Record<string, unknown>;
    const payload = this.augmentPayload()(this.fromFormValue()(raw));
    const id = this.editingId();
    const req = id ? this.resource().update(id, payload) : this.resource().create(payload);

    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.editingId.set(null);
        this.toast.success(id ? 'Updated' : 'Created');
        this.loadData();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to save');
      },
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    const id = row['id'] as string | undefined;
    if (!id) return;

    this.confirm
      .confirm(`Delete ${this.entityLabel()}`, 'Are you sure?')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ok) => {
          if (!ok) return;
          this.resource()
            .delete(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.toast.success('Deleted');
                this.loadData();
              },
              error: () => this.toast.error('Failed to delete'),
            });
        },
      });
  }
}
