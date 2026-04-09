import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

/**
 * Not migrated to GenericCrudComponent: the profile is a singleton —
 * there is no list/create/delete, only `get` + `update`. Wrapping it
 * in the generic CRUD component would add indirection for zero win.
 */

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <h1 class="text-2xl font-bold text-white">Profile</h1>

      <form
        [formGroup]="form"
        (ngSubmit)="save()"
        class="space-y-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl"
      >
        <!-- Photo preview -->
        @if (form.value.photo_url) {
          <div class="flex justify-center">
            <img
              [src]="form.value.photo_url"
              alt="Profile"
              class="h-24 w-24 rounded-full border-2 border-white/10 object-cover"
            />
          </div>
        }

        <div class="grid gap-5 md:grid-cols-2">
          @for (field of fields; track field.key) {
            <div [class.md:col-span-2]="field.wide">
              <label [for]="'profile-' + field.key" class="mb-1.5 block text-xs font-medium text-white/50">{{ field.label }}</label>
              @if (field.type === 'textarea') {
                <textarea
                  [id]="'profile-' + field.key"
                  [formControlName]="field.key"
                  rows="4"
                  class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
                ></textarea>
              } @else {
                <input
                  [id]="'profile-' + field.key"
                  [formControlName]="field.key"
                  [type]="field.type || 'text'"
                  class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
                />
              }
            </div>
          }
        </div>

        <!-- i18n section -->
        <div class="border-t border-white/[0.06] pt-5">
          <h3 class="mb-4 text-sm font-semibold text-white/60">English Translations</h3>
          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label for="profile-title-en" class="mb-1.5 block text-xs font-medium text-white/50">Title (EN)</label>
              <input
                id="profile-title-en"
                formControlName="title_en"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label for="profile-subtitle-en" class="mb-1.5 block text-xs font-medium text-white/50">Subtitle (EN)</label>
              <input
                id="profile-subtitle-en"
                formControlName="subtitle_en"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div class="md:col-span-2">
              <label for="profile-bio-en" class="mb-1.5 block text-xs font-medium text-white/50">Bio (EN)</label>
              <textarea
                id="profile-bio-en"
                formControlName="bio_en"
                rows="4"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/50"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- CV Upload -->
        <div class="border-t border-white/[0.06] pt-5">
          <h3 class="mb-4 text-sm font-semibold text-white/60">CV Upload</h3>
          <div class="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              (change)="onCvSelected($event)"
              class="text-sm text-white/50 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500/20 file:px-4 file:py-2 file:text-sm file:text-indigo-400 file:transition-colors hover:file:bg-indigo-500/30"
            />
            @if (cvUrl()) {
              <a
                [href]="cvUrl()"
                target="_blank"
                class="text-xs text-indigo-400 underline"
                >View current CV</a
              >
            }
          </div>
          @if (uploadingCv()) {
            <p class="mt-2 text-xs text-white/40">Uploading...</p>
          }
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            [disabled]="saving()"
            class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
          >
            {{ saving() ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProfileEditorComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);
  readonly uploadingCv = signal(false);
  readonly cvUrl = signal('');

  readonly form = this.fb.nonNullable.group({
    full_name: [''],
    title: [''],
    subtitle: [''],
    bio: [''],
    photo_url: [''],
    email: [''],
    phone: [''],
    location: [''],
    title_en: [''],
    subtitle_en: [''],
    bio_en: [''],
  });

  readonly fields = [
    { key: 'full_name', label: 'Full Name', type: 'text', wide: false },
    { key: 'title', label: 'Title', type: 'text', wide: false },
    { key: 'subtitle', label: 'Subtitle', type: 'text', wide: true },
    { key: 'bio', label: 'Bio', type: 'textarea', wide: true },
    { key: 'photo_url', label: 'Photo URL', type: 'url', wide: true },
    { key: 'email', label: 'Email', type: 'email', wide: false },
    { key: 'phone', label: 'Phone', type: 'text', wide: false },
    { key: 'location', label: 'Location', type: 'text', wide: false },
  ];

  ngOnInit(): void {
    this.admin
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.form.patchValue(profile as unknown as Record<string, string>);
        },
      });
  }

  save(): void {
    this.saving.set(true);
    this.admin
      .updateProfile(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Profile updated successfully');
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Failed to update profile');
        },
      });
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingCv.set(true);
    this.admin
      .uploadCv(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.uploadingCv.set(false);
          this.cvUrl.set(res.url);
          this.toast.success('CV uploaded successfully');
        },
        error: () => {
          this.uploadingCv.set(false);
          this.toast.error('Failed to upload CV');
        },
      });
  }
}
