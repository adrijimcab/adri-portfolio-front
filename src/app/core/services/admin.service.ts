import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable} from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Profile, Experience, Project, Technology, Education,
  Certification, SocialLink, SiteConfig, SectionConfig, GitHubRepo,
} from '../models';

interface ApiRes<T> { data: T }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private get<T>(path: string): Observable<T> {
    return this.http.get<ApiRes<T>>(`${this.base}/${path}`).pipe(map((r) => r.data));
  }

  // Profile
  getProfile(): Observable<Profile> { return this.get<Profile>('profile'); }
  updateProfile(data: Partial<Profile>): Observable<Profile> {
    return this.http.put<ApiRes<Profile>>(`${this.base}/admin/profile`, data).pipe(map((r) => r.data));
  }

  // Experiences
  getExperiences(): Observable<Experience[]> { return this.get<Experience[]>('experience'); }
  createExperience(data: Partial<Experience>): Observable<Experience> {
    return this.http.post<ApiRes<Experience>>(`${this.base}/admin/experiences`, data).pipe(map((r) => r.data));
  }
  updateExperience(id: string, data: Partial<Experience>): Observable<Experience> {
    return this.http.put<ApiRes<Experience>>(`${this.base}/admin/experiences/${id}`, data).pipe(map((r) => r.data));
  }
  deleteExperience(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/experiences/${id}`);
  }

  // Projects
  getProjects(): Observable<Project[]> { return this.get<Project[]>('projects'); }
  createProject(data: Partial<Project>): Observable<Project> {
    return this.http.post<ApiRes<Project>>(`${this.base}/admin/projects`, data).pipe(map((r) => r.data));
  }
  updateProject(id: string, data: Partial<Project>): Observable<Project> {
    return this.http.put<ApiRes<Project>>(`${this.base}/admin/projects/${id}`, data).pipe(map((r) => r.data));
  }
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/projects/${id}`);
  }

  // Technologies
  getTechnologies(): Observable<Technology[]> { return this.get<Technology[]>('technologies/flat'); }
  createTechnology(data: Partial<Technology>): Observable<Technology> {
    return this.http.post<ApiRes<Technology>>(`${this.base}/admin/technologies`, data).pipe(map((r) => r.data));
  }
  updateTechnology(id: string, data: Partial<Technology>): Observable<Technology> {
    return this.http.put<ApiRes<Technology>>(`${this.base}/admin/technologies/${id}`, data).pipe(map((r) => r.data));
  }
  deleteTechnology(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/technologies/${id}`);
  }

  // Education
  getEducation(): Observable<Education[]> { return this.get<Education[]>('education'); }
  createEducation(data: Partial<Education>): Observable<Education> {
    return this.http.post<ApiRes<Education>>(`${this.base}/admin/education`, data).pipe(map((r) => r.data));
  }
  updateEducation(id: string, data: Partial<Education>): Observable<Education> {
    return this.http.put<ApiRes<Education>>(`${this.base}/admin/education/${id}`, data).pipe(map((r) => r.data));
  }
  deleteEducation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/education/${id}`);
  }

  // Certifications
  getCertifications(): Observable<Certification[]> { return this.get<Certification[]>('certifications'); }
  createCertification(data: Partial<Certification>): Observable<Certification> {
    return this.http.post<ApiRes<Certification>>(`${this.base}/admin/certifications`, data).pipe(map((r) => r.data));
  }
  updateCertification(id: string, data: Partial<Certification>): Observable<Certification> {
    return this.http.put<ApiRes<Certification>>(`${this.base}/admin/certifications/${id}`, data).pipe(map((r) => r.data));
  }
  deleteCertification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/certifications/${id}`);
  }

  // Social Links
  getSocialLinks(): Observable<SocialLink[]> { return this.get<SocialLink[]>('config/social'); }
  createSocialLink(data: Partial<SocialLink>): Observable<SocialLink> {
    return this.http.post<ApiRes<SocialLink>>(`${this.base}/admin/social-links`, data).pipe(map((r) => r.data));
  }
  updateSocialLink(id: string, data: Partial<SocialLink>): Observable<SocialLink> {
    return this.http.put<ApiRes<SocialLink>>(`${this.base}/admin/social-links/${id}`, data).pipe(map((r) => r.data));
  }
  deleteSocialLink(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/social-links/${id}`);
  }

  // Site Config
  getSiteConfig(): Observable<SiteConfig> { return this.get<SiteConfig>('config/site'); }
  updateSiteConfig(data: Record<string, string>): Observable<SiteConfig> {
    return this.http.put<ApiRes<SiteConfig>>(`${this.base}/admin/config/site`, { config: data }).pipe(map((r) => r.data));
  }

  // Sections Config
  getSections(): Observable<SectionConfig[]> { return this.get<SectionConfig[]>('config/sections'); }
  updateSections(data: SectionConfig[]): Observable<SectionConfig[]> {
    return this.http.put<ApiRes<SectionConfig[]>>(`${this.base}/admin/config/sections`, { sections: data }).pipe(map((r) => r.data));
  }

  // GitHub
  getGithubRepos(): Observable<GitHubRepo[]> { return this.get<GitHubRepo[]>('github/repos'); }
  syncGithub(): Observable<{ synced: number }> {
    return this.http.post<ApiRes<{ synced: number }>>(`${this.base}/admin/github/sync`, {}).pipe(map((r) => r.data));
  }
  updateGithubRepo(id: string, data: Partial<GitHubRepo>): Observable<GitHubRepo> {
    return this.http.put<ApiRes<GitHubRepo>>(`${this.base}/admin/github/repos/${id}`, data).pipe(map((r) => r.data));
  }

  // CV Upload
  uploadCv(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiRes<{ url: string }>>(`${this.base}/admin/cv/upload`, formData).pipe(map((r) => r.data));
  }
}
