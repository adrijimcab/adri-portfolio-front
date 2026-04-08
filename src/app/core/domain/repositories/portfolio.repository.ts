import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  Profile,
  Experience,
  Project,
  TechnologyGroup,
  Education,
  Course,
  SiteConfig,
  SectionConfig,
  SocialLink,
  Certification,
  GitHubRepo,
} from '../entities';

/**
 * Portfolio domain port.
 *
 * Pure read contract for portfolio content. Concrete adapters live under
 * `core/infrastructure` (e.g. `HttpPortfolioRepository`). Consumers should
 * depend on this interface via the `PORTFOLIO_REPOSITORY` token, never on
 * the adapter directly.
 */
export interface PortfolioRepository {
  getProfile(): Observable<Profile>;
  getExperiences(): Observable<Experience[]>;
  getTechnologies(): Observable<TechnologyGroup[]>;
  getFeaturedProjects(): Observable<Project[]>;
  getAllProjects(): Observable<Project[]>;
  getProjectBySlug(slug: string): Observable<Project>;
  getEducation(): Observable<{ education: Education[]; courses: Course[] }>;
  getSiteConfig(): Observable<SiteConfig>;
  getSections(): Observable<SectionConfig[]>;
  getSocialLinks(): Observable<SocialLink[]>;
  getCertifications(): Observable<Certification[]>;
  getCertificationById(id: string): Observable<Certification>;
  getGithubRepos(): Observable<GitHubRepo[]>;
  getCvUrl(): Observable<{ url: string }>;
}

export const PORTFOLIO_REPOSITORY = new InjectionToken<PortfolioRepository>(
  'PORTFOLIO_REPOSITORY',
);
