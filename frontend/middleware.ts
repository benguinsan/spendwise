import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    // Redirect to login if accessing protected route without token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname === "/login") {
    // Redirect to dashboard if already logged in
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
