/**
 * Resolves the dynamic site origin URL from request headers or environment variables.
 * Ensures redirects in authentication flows (email verification, OAuth, magic links)
 * point to the real host (e.g. https://steply-app.vercel.app) rather than localhost:3000.
 */
export function getSiteOrigin(request?: Request): string {
  if (request) {
    // 1. Check x-forwarded-host (standard for Vercel and reverse proxies)
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }

    // 2. Check origin header if present
    const origin = request.headers.get("origin");
    if (origin && (process.env.NODE_ENV === "development" || !origin.includes("localhost"))) {
      return origin;
    }
  }

  // 3. Client-side window check
  if (typeof window !== "undefined" && window.location?.origin) {
    if (process.env.NODE_ENV === "development" || !window.location.origin.includes("localhost")) {
      return window.location.origin;
    }
  }

  // 4. Configured site URL environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // 5. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 6. Request URL parsing
  if (request) {
    try {
      const url = new URL(request.url);
      if (process.env.NODE_ENV === "development" || !url.origin.includes("localhost")) {
        return url.origin;
      }
    } catch {}
  }

  // 7. Canonical production fallback
  return "https://steply-app.vercel.app";
}
