import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'viewdiet/:id', renderMode: RenderMode.Server },
  { path: 'viewrecipe/:id', renderMode: RenderMode.Server },
  { path: 'editrecipe/:id', renderMode: RenderMode.Server },
  { path: 'editdiet/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
