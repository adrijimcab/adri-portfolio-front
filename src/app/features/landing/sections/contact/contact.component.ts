import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  input,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { LinkedinWidgetComponent } from '../../../../shared/components/linkedin-widget/linkedin-widget.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { MagneticDirective } from '../../../../shared/directives/magnetic.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import { ApiService } from '../../../../core/services/api.service';
import type { Profile, SocialLink } from '../../../../core/models';

interface ContactResponse {
  success: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    SectionHeaderComponent,
    GlassmorphismCardComponent,
    LinkedinWidgetComponent,
    ScrollAnimateDirective,
    MagneticDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="py-24 px-6">
      <div class="mx-auto max-w-2xl text-center">
        <app-section-header [title]="t.t('contact.title')" [label]="t.t('contact.label')" />

        <div appScrollAnimate>
          <app-glass-card>
            @if (!formSent()) {
              <p class="mb-6 text-white/60">{{ t.t('contact.subtitle') }}</p>

              <form
                (ngSubmit)="sendMessage()"
                class="space-y-4 text-left"
                [attr.aria-describedby]="formError() ? 'contact-error' : null"
              >
                <div>
                  <input
                    id="contact-name"
                    type="text"
                    [(ngModel)]="formName"
                    name="name"
                    autocomplete="name"
                    [placeholder]="t.t('contact.name')"
                    required
                    aria-required="true"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <input
                    id="contact-email"
                    type="email"
                    [(ngModel)]="formEmail"
                    name="email"
                    autocomplete="email"
                    [placeholder]="t.t('contact.email')"
                    required
                    aria-required="true"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <textarea
                    id="contact-message"
                    [(ngModel)]="formMessage"
                    name="message"
                    autocomplete="off"
                    [placeholder]="t.t('contact.message')"
                    required
                    aria-required="true"
                    rows="4"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.08] resize-none"
                  ></textarea>
                </div>
                <div aria-live="polite" [attr.aria-busy]="sending()">
                  <button
                    type="submit"
                    [disabled]="sending()"
                    appMagnetic
                    [strength]="0.25"
                    class="w-full rounded-xl px-8 py-4 text-white font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                    style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"
                  >
                    @if (sending()) {
                      {{ t.t('contact.sending') }}
                    } @else {
                      {{ t.t('contact.send') }}
                    }
                  </button>
                </div>
              </form>

              @if (formError()) {
                <p id="contact-error" class="mt-4 text-sm text-red-400" role="alert">
                  {{ formError() }}
                </p>
              }
            } @else {
              <div class="py-8">
                <div
                  class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"
                >
                  <svg
                    class="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">{{ t.t('contact.sent_title') }}</h3>
                <p class="mt-2 text-white/60">{{ t.t('contact.sent_message') }}</p>
              </div>
            }
          </app-glass-card>
        </div>

        <div class="mt-8" appScrollAnimate [delay]="200">
          <app-linkedin-widget
            [name]="profile()?.full_name || 'Adrián Jiménez Cabello'"
            [title]="profile()?.title || 'Frontend Architect'"
          />
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  private readonly api = inject(ApiService);
  readonly t = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  profile = input<Profile | undefined>();
  socialLinks = input<SocialLink[]>([]);

  formName = '';
  formEmail = '';
  formMessage = '';
  readonly sending = signal(false);
  readonly formSent = signal(false);
  readonly formError = signal('');

  sendMessage(): void {
    if (!this.formName || !this.formEmail || !this.formMessage) return;

    this.sending.set(true);
    this.formError.set('');

    this.api
      .post<ContactResponse>('contact', {
        name: this.formName,
        email: this.formEmail,
        message: this.formMessage,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.sending.set(false);
          this.formSent.set(true);
        },
        error: () => {
          this.sending.set(false);
          this.formError.set(this.t.t('contact.error'));
        },
      });
  }
}
