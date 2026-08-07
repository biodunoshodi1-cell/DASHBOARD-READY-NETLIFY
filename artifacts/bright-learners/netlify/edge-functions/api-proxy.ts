// Proxies every /api/* request from the Netlify site to the real backend
// (artifacts/api-server, hosted on Render/Railway/Fly/etc).
//
// Why an Edge Function instead of a plain [[redirects]] rule: Netlify's
// static redirects can't read environment variables, so the backend URL
// would have to be hand-typed into netlify.toml and the site redeployed
// every time it changes. This reads it from a site environment variable
// (BACKEND_URL) at request time instead — set it once in the Netlify UI
// under Site settings > Environment variables, no redeploy needed after.
//
// Because this runs server-side, the browser only ever talks to your own
// Netlify domain — no CORS setup and no cross-site cookie issues.

export default async (request: Request) => {
  const backendUrl = Deno.env.get('BACKEND_URL');

  if (!backendUrl) {
    return new Response(
      JSON.stringify({
        error:
          'BACKEND_URL is not set. Add it in Netlify: Site settings > Environment variables > BACKEND_URL, ' +
          'set to your deployed api-server URL (e.g. https://bright-learners-api.onrender.com), then redeploy.',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, backendUrl);

  const proxied = await fetch(target, {
    method: request.method,
    headers: request.headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });

  return new Response(proxied.body, {
    status: proxied.status,
    headers: proxied.headers,
  });
};

export const config = { path: '/api/*' };
