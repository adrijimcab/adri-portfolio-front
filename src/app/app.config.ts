import type { ApplicationConfig} from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { PORTFOLIO_REPOSITORY } from './core/domain/repositories';
import { HttpPortfolioRepository } from './core/infrastructure/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, cacheInterceptor])),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    { provide: PORTFOLIO_REPOSITORY, useExisting: HttpPortfolioRepository },
  ],
};
