import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/src/lib/admin-auth";

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath && nextPath !== "/admin/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifyAdminSessionToken(sessionCookie);
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isLoginPage) {
    return NextResponse.next();
  }

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(buildLoginUrl(request));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
