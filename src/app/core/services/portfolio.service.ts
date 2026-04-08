import { Injectable, inject, runInInjectionContext, EnvironmentInjector, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type {
  Profile, Experience, Project, TechnologyGroup,
  SiteConfig, SectionConfig, SocialLink, Education, Course,
  Certification, GitHubRepo,
} from '../models';

/**
 * Portfolio data gateway.
 *
 * Historical note: this used to eagerly fire 10 HTTP requests from the
 * constructor via `toSignal(api.get(...))`. That hit the API on every
 * navigation — including /login and /404 — and crushed SSR. The service
 * now exposes:
 *
 * 1. Lazy signal accessors (`profile`, `experiences`, ...) that only
 *    create their HTTP subscription on first read, cached for the lifetime
 *    of the service. Components using the old `portfolio.profile()` call
 *    site keep working with no changes.
 * 2. Pull-based observable methods (`getProfile()`, `getExperiences()`,
 *    ...) for container components that want explicit control (e.g. to
 *    feed an `rxResource` or combine with `takeUntilDestroyed`).
 *
 * Fase 3: collapse into repository + use-case layers with hexagonal
 * architecture (see audit F-005).
 */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly api = inject(ApiService);
  private readonly injector = inject(EnvironmentInjector);
  private readonly signalCache = new Map<string, Signal<unknown>>();

  // --- Pull-based observable API ---

  getProfile(): Observable<Profile> {
    return this.api.get<Profile>('profile');
  }

  getExperiences(): Observable<Experience[]> {
    return this.api.get<Experience[]>('experience');
  }

  getTechnologies(): Observable<TechnologyGroup[]> {
    return this.api.get<TechnologyGroup[]>('technologies');
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('projects?featured=true');
  }

  getEducation(): Observable<{ education: Education[]; courses: Course[] }> {
    return this.api.get<{ education: Education[]; courses: Course[] }>('education');
  }

  getSiteConfig(): Observable<SiteConfig> {
    return this.api.get<SiteConfig>('config/site');
  }

  getSections(): Observable<SectionConfig[]> {
    return this.api.get<SectionConfig[]>('config/sections');
  }

  getSocialLinks(): Observable<SocialLink[]> {
    return this.api.get<SocialLink[]>('config/social');
  }

  getCertifications(): Observable<Certification[]> {
    return this.api.get<Certification[]>('certifications');
  }

  getGithubRepos(): Observable<GitHubRepo[]> {
    return this.api.get<GitHubRepo[]>('github/repos');
  }

  getAllProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('projects');
  }

  getProjectBySlug(slug: string): Observable<Project> {
    return this.api.get<Project>(`projects/${slug}`);
  }

  getCvUrl(): Observable<{ url: string }> {
    return this.api.get<{ url: string }>('cv/url');
  }

  getCertificationById(id: string): Observable<Certification> {
    return this.api.get<Certification>(`certifications/${id}`);
  }

  // --- Lazy signal API (back-compat with existing consumers) ---

  readonly profile = this.lazySignal<Profile>('profile', () => this.getProfile());
  readonly experiences = this.lazySignal<Experience[]>('experiences', () => this.getExperiences());
  readonly technologies = this.lazySignal<TechnologyGroup[]>('technologies', () =>
    this.getTechnologies(),
  );
  readonly featuredProjects = this.lazySignal<Project[]>('featuredProjects', () =>
    this.getFeaturedProjects(),
  );
  readonly education = this.lazySignal<{ education: Education[]; courses: Course[] }>(
    'education',
    () => this.getEducation(),
  );
  readonly siteConfig = this.lazySignal<SiteConfig>('siteConfig', () => this.getSiteConfig());
  readonly sections = this.lazySignal<SectionConfig[]>('sections', () => this.getSections());
  readonly socialLinks = this.lazySignal<SocialLink[]>('socialLinks', () => this.getSocialLinks());
  readonly certifications = this.lazySignal<Certification[]>('certifications', () =>
    this.getCertifications(),
  );
  readonly githubRepos = this.lazySignal<GitHubRepo[]>('githubRepos', () => this.getGithubRepos());

  /**
   * Returns a callable signal that defers creating the underlying HTTP
   * subscription until the first call. On first read we run `toSignal`
   * inside the root injection context and cache the resulting signal.
   */
  private lazySignal<T>(key: string, loader: () => Observable<T>): Signal<T | undefined> {
    const cache = this.signalCache;
    const injector = this.injector;
    const reader = (): T | undefined => {
      const cached = cache.get(key) as Signal<T | undefined> | undefined;
      if (cached) return cached();
      const created: Signal<T | undefined> = runInInjectionContext(injector, () =>
        toSignal<T | undefined>(loader() as Observable<T | undefined>, {
          initialValue: undefined,
        }),
      );
      cache.set(key, created as Signal<unknown>);
      return created();
    };
    return reader as Signal<T | undefined>;
  }
}
