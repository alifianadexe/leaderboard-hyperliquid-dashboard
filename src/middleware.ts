import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes require authentication
const protectedRoutes = [
  "/profile",
  "/exchange-keys",
  "/settings",
  "/copy-trading",
  "/portfolio",
];
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /profile, /exchange-keys)
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's an auth route (login page)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get the auth token from cookies
  const token = request.cookies.get("auth_token")?.value;

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page with valid token, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  // Match all routes except:
  // - api routes (handled separately)
  // - static files
  // - image optimization files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
