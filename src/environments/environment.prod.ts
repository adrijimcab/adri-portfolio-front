/**
 * Production environment configuration.
 *
 * The apiUrl can be overridden at build-time via Angular's `fileReplacements`
 * or by setting a global `__API_URL__` before the app bootstraps (e.g., in
 * a Vercel/Railway build step). The hardcoded default points to the current
 * Railway production deployment.
 */
export const environment = {
  production: true,
  apiUrl:
    (typeof globalThis !== 'undefined' &&
      ((globalThis as Record<string, unknown>)['__API_URL__'] as string | undefined)) ??
    'https://adri-portfolio-api-production.up.railway.app/api',
  githubOAuthClientId: 'Ov23lisIO1VFmdcaTe4f',
};
