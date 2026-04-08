import { Component, ChangeDetectionStrategy, input, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { LinkedinWidgetComponent } from '../../../../shared/components/linkedin-widget/linkedin-widget.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { MagneticDirective } from '../../../../shared/directives/magnetic.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import { Profile, SocialLink } from '../../../../core/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, SectionHeaderComponent, GlassmorphismCardComponent, LinkedinWidgetComponent, ScrollAnimateDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="py-24 px-6">
      <div class="mx-auto max-w-2xl text-center">
        <app-section-header [title]="t.t('contact.title')" [label]="t.t('contact.label')" />

        <div appScrollAnimate>
          <app-glass-card>
            @if (!formSent()) {
              <p class="mb-6 text-white/60">{{ t.t('contact.subtitle') }}</p>

              <form (ngSubmit)="sendMessage()" class="space-y-4 text-left">
                <div>
                  <input id="contact-name" type="text" [(ngModel)]="formName" name="name" autocomplete="name" [placeholder]="t.t('contact.name')" required
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.08]" />
                </div>
                <div>
                  <input id="contact-email" type="email" [(ngModel)]="formEmail" name="email" autocomplete="email" [placeholder]="t.t('contact.email')" required
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.08]" />
                </div>
                <div>
                  <textarea id="contact-message" [(ngModel)]="formMessage" name="message" autocomplete="off" [placeholder]="t.t('contact.message')" required rows="4"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.08] resize-none"></textarea>
                </div>
                <button type="submit" [disabled]="sending()"
                  appMagnetic [strength]="0.25"
                  class="w-full rounded-xl px-8 py-4 text-white font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                  style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
                  @if (sending()) {
                    {{ t.t('contact.sending') }}
                  } @else {
                    {{ t.t('contact.send') }}
                  }
                </button>
              </form>

              @if (formError()) {
                <p class="mt-4 text-sm text-red-400">{{ formError() }}</p>
              }
            } @else {
              <div class="py-8">
                <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                     style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
                  <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">{{ t.t('contact.sent_title') }}</h3>
                <p class="mt-2 text-white/60">{{ t.t('contact.sent_message') }}</p>
              </div>
            }

            @if (socialLinks().length) {
              <div class="mt-8 flex justify-center gap-4">
                @for (link of socialLinks(); track link.id) {
                  <a [href]="link.url" target="_blank" rel="noopener noreferrer"
                     class="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-all hover:border-white/20 hover:text-white hover:scale-110">
                    {{ link.platform.charAt(0).toUpperCase() }}
                  </a>
                }
              </div>
            }
          </app-glass-card>
        </div>

        <div class="mt-8" appScrollAnimate [delay]="200">
          <app-linkedin-widget
            [name]="profile()?.full_name || 'Adrián Jiménez Cabello'"
            [title]="profile()?.title || 'Frontend Architect'" />
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  private readonly http = inject(HttpClient);
  readonly t = inject(TranslateService);
  profile = input<Profile | undefined>();
  socialLinks = input<SocialLink[]>([]);

  formName = '';
  formEmail = '';
  formMessage = '';
  readonly sending = signal(false);
  readonly formSent = signal(false);
  readonly formError = signal('');

  sendMessage() {
    if (!this.formName || !this.formEmail || !this.formMessage) return;

    this.sending.set(true);
    this.formError.set('');

    this.http.post('https://api.web3forms.com/submit', {
      access_key: '710f3bff-efbf-47c0-b4c5-967f01e9889a',
      name: this.formName,
      email: this.formEmail,
      message: this.formMessage,
      from_name: 'Portfolio Contact Form',
      subject: `Portfolio: Message from ${this.formName}`,
    }).subscribe({
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
