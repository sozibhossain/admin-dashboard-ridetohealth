// middleware.ts (or middleware.js)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // If no token or user is not admin → redirect to login or forbidden page
    if (!token || token.role !== "admin") {
      // Option 1: Redirect to login (recommended)
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/", req.url));

      // Option 2: Show 403 page
      // return NextResponse.redirect(new URL("/403", req.url));
    }

    // User is admin → continue
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback controls whether `withAuth` runs the middleware function
      authorized: ({ token }) => !!token, // Run middleware only if logged in
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/services/:path*",
    "/taxi/:path*",
    "/drivers/:path*",
    "/users-profile/:path*",
    "/driver-request/:path*",
    "/ride-history/:path*",
    "/promo-code/:path*",
    "/commission/:path*",
    "/settings/:path*",
  ],
};