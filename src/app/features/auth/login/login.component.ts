import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black">
      <!-- Aurora effect -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-indigo-500/10 blur-3xl"
        ></div>
        <div
          class="absolute -right-1/4 -bottom-1/4 h-3/4 w-3/4 rounded-full bg-purple-500/10 blur-3xl"
        ></div>
      </div>

      <div
        class="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-xl"
      >
        <!-- Logo -->
        <div class="mb-8 text-center">
          <h1
            class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent"
          >
            AJC.
          </h1>
          <p class="mt-2 text-sm text-white/40">Admin Panel</p>
        </div>

        @if (!showForgotPassword()) {
          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
            <div>
              <label for="login-email" class="mb-1.5 block text-xs font-medium text-white/60">Email</label>
              <input
                id="login-email"
                formControlName="email"
                type="email"
                autocomplete="username"
                placeholder="your@email.com"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
            </div>
            <div>
              <label for="login-password" class="mb-1.5 block text-xs font-medium text-white/60">Password</label>
              <input
                id="login-password"
                formControlName="password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
            </div>

            @if (errorMessage()) {
              <div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {{ errorMessage() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
            >
              @if (loading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign In
              }
            </button>

            <div class="text-center">
              <button
                type="button"
                (click)="showForgotPassword.set(true)"
                class="text-xs text-white/40 transition-colors hover:text-white/60"
              >
                Forgot password?
              </button>
            </div>
          </form>
        } @else {
          <!-- Forgot Password Form -->
          <form [formGroup]="forgotForm" (ngSubmit)="onForgotPassword()" class="space-y-5">
            <p class="text-sm text-white/60">
              Enter your email and we'll send you a password reset link.
            </p>
            <div>
              <label for="forgot-email" class="mb-1.5 block text-xs font-medium text-white/60">Email</label>
              <input
                id="forgot-email"
                formControlName="email"
                type="email"
                autocomplete="username"
                placeholder="your@email.com"
                class="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
            </div>

            @if (forgotMessage()) {
              <div
                class="rounded-lg border px-4 py-3 text-sm"
                [class]="
                  forgotSuccess()
                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                "
              >
                {{ forgotMessage() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
            >
              Send Reset Link
            </button>

            <div class="text-center">
              <button
                type="button"
                (click)="showForgotPassword.set(false); forgotMessage.set('')"
                class="text-xs text-white/40 transition-colors hover:text-white/60"
              >
                Back to login
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showForgotPassword = signal(false);
  readonly forgotMessage = signal('');
  readonly forgotSuccess = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.auth.handleLoginSuccess(res);
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else if (err.status === 0) {
          this.errorMessage.set('Network error. Please check your connection.');
        } else {
          this.errorMessage.set('An unexpected error occurred. Please try again.');
        }
      },
    });
  }

  onForgotPassword(): void {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    this.forgotMessage.set('');

    const { email } = this.forgotForm.getRawValue();
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.forgotSuccess.set(true);
        this.forgotMessage.set('Reset link sent! Check your email.');
      },
      error: () => {
        this.loading.set(false);
        this.forgotSuccess.set(false);
        this.forgotMessage.set('Failed to send reset link. Please try again.');
      },
    });
  }
}
