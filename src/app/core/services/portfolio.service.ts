import { Injectable, inject, runInInjectionContext, EnvironmentInjector, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { PORTFOLIO_REPOSITORY } from '../domain/repositories';
import type {
  Profile, Experience, Project, TechnologyGroup,
  SiteConfig, SectionConfig, SocialLink, Education, Course,
  Certification, GitHubRepo,
} from '../domain/entities';

/**
 * Portfolio façade.
 *
 * Historical note: this used to eagerly fire 10 HTTP requests from the
 * constructor. Fase 2.A made it pull-based with lazy signals. Fase 3
 * collapsed it into a thin façade over {@link PortfolioRepository} — all
 * the data-access logic lives in the repository (port/adapter); this
 * class only adds:
 *
 * 1. Back-compat signal accessors (`profile()`, `experiences()`, ...)
 *    used by older consumers. Lazy, cached, created only on first read.
 * 2. A convenience pull-based surface that simply delegates to the port.
 *
 * New code should inject {@link PORTFOLIO_REPOSITORY} directly instead
 * of using this service.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly repo = inject(PORTFOLIO_REPOSITORY);
  private readonly injector = inject(EnvironmentInjector);
  private readonly signalCache = new Map<string, Signal<unknown>>();

  // --- Pull-based observable API (delegates to repository) ---

  getProfile(): Observable<Profile> {
    return this.repo.getProfile();
  }

  getExperiences(): Observable<Experience[]> {
    return this.repo.getExperiences();
  }

  getTechnologies(): Observable<TechnologyGroup[]> {
    return this.repo.getTechnologies();
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.repo.getFeaturedProjects();
  }

  getEducation(): Observable<{ education: Education[]; courses: Course[] }> {
    return this.repo.getEducation();
  }

  getSiteConfig(): Observable<SiteConfig> {
    return this.repo.getSiteConfig();
  }

  getSections(): Observable<SectionConfig[]> {
    return this.repo.getSections();
  }

  getSocialLinks(): Observable<SocialLink[]> {
    return this.repo.getSocialLinks();
  }

  getCertifications(): Observable<Certification[]> {
    return this.repo.getCertifications();
  }

  getGithubRepos(): Observable<GitHubRepo[]> {
    return this.repo.getGithubRepos();
  }

  getAllProjects(): Observable<Project[]> {
    return this.repo.getAllProjects();
  }

  getProjectBySlug(slug: string): Observable<Project> {
    return this.repo.getProjectBySlug(slug);
  }

  getCvUrl(): Observable<{ url: string }> {
    return this.repo.getCvUrl();
  }

  getCertificationById(id: string): Observable<Certification> {
    return this.repo.getCertificationById(id);
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
