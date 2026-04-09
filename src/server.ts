import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 *
 * TODO(F-024): Full CSP nonce — eliminate inline script entirely
 * Plan:
 *   1. Read `theme` cookie from `req.headers.cookie` (default 'dark')
 *   2. After `angularApp.handle(req)`, read response body as text
 *   3. Replace `<html lang="es">` → `<html lang="es" data-theme="${theme}" class="${theme}" style="color-scheme:${theme}">`
 *   4. Write modified Response via `writeResponseToNodeResponse`
 *   5. In ThemeService.toggle(), also set `document.cookie = 'theme=${next};path=/;max-age=31536000;SameSite=Lax'`
 *   6. Remove the inline <script> from index.html
 *   7. Update CSP script-src to just `'self'` (drop sha256 hash)
 * Blocked: step 5 requires modifying src/app/core/services/theme.service.ts
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] ?? 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.info(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
