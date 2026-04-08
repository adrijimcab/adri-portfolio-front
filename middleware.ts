// Vercel Edge middleware — runs before every request, before any rewrite or
// routing. We use it to 301 www.adrianjimenezcabello.dev → apex domain so the
// canonical URL is always the naked host. `vercel.json` host-based redirects
// did not consistently fire for this alias, so the logic lives here instead.

export const config = {
  matcher: '/:path*',
};

export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (url.hostname === 'www.adrianjimenezcabello.dev') {
    const target = new URL(
      url.pathname + url.search,
      'https://adrianjimenezcabello.dev',
    );
    return Response.redirect(target.toString(), 301);
  }
  return undefined;
}
