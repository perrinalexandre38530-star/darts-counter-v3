// functions/_middleware.ts — Cloudflare Pages Function
export const onRequest: PagesFunction = async ({ next }) => {
  const res = await next();

  // ✅ CSP complète : autorise avatars (data:/blob:) + Google Fonts
  const csp =
    "default-src 'self'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'; " +
    "connect-src 'self' https: wss:; " +
    "worker-src 'self' blob:; " +
    "manifest-src 'self'";

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Permissions-Policy", "camera=(), microphone=()");

  return res;
};
