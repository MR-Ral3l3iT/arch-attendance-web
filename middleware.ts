import { NextRequest, NextResponse } from "next/server";

/** Old single-language URLs → default Thai locale (permanent redirect for store listings). */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/privacy": "/th/privacy",
  "/terms": "/th/terms",
  "/data-deletion": "/th/data-deletion",
};

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
};

function isMarketingPublic(pathname: string): boolean {
  return (
    pathname === "/th" ||
    pathname === "/en" ||
    pathname.startsWith("/th/") ||
    pathname.startsWith("/en/")
  );
}

function localeFromPath(pathname: string): string {
  if (pathname.startsWith("/en")) return "en";
  return "th";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacy = LEGACY_REDIRECTS[pathname];
  if (legacy) {
    return NextResponse.redirect(new URL(legacy, request.url), 308);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/th", request.url), 307);
  }

  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value ?? "";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", localeFromPath(pathname));

  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    isMarketingPublic(pathname);

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/login" || pathname === "/th" || pathname === "/en")) {
    const dest = ROLE_HOME[role] ?? "/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/teacher") && role !== "TEACHER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|fonts/).*)"],
};
