import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * next-intl locale negotiation. In Next.js 16 this file is `proxy.ts`
 * (was `middleware.ts`); `createMiddleware` is unchanged.
 *
 * The matcher MUST exclude api, _next, _vercel and any dotted path (static
 * files) — otherwise the proxy rewrites asset requests and breaks
 * fonts/images and causes redirect loops.
 */
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
