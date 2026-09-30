import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip /api (the proxy buffers request bodies, which would break uploads),
  // Next.js internals, and any path containing a dot (static files).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
