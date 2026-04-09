import type { ServerRoute } from '@angular/ssr';
import { RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve([{ lang: 'es' }, { lang: 'en' }]),
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
