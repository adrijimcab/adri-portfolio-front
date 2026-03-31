import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component').then((m) => m.ProjectListComponent),
  },
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./features/projects/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
  },
  {
    path: 'cv',
    loadComponent: () =>
      import('./features/cv-viewer/cv-viewer.component').then((m) => m.CvViewerComponent),
  },
  {
    path: 'certifications/:id',
    loadComponent: () =>
      import('./features/certifications/certification-detail/certification-detail.component').then((m) => m.CertificationDetailComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
