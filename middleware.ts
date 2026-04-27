import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];

const ROLE_HOME: Record<string, string> = {
  ADMIN:   "/admin",
  TEACHER: "/teacher",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const role  = request.cookies.get("user_role")?.value ?? "";

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  // Not logged in → redirect to login (remember the destination)
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → bounce away from login or root
  if (token && (pathname === "/login" || pathname === "/")) {
    const dest = ROLE_HOME[role] ?? "/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Guard /admin routes — only ADMIN
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Guard /teacher routes — only TEACHER
  if (pathname.startsWith("/teacher") && role !== "TEACHER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|fonts/).*)"],
};
