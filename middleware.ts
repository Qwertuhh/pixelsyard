import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow webhook endpoint
        if (pathname.startsWith("/api/webhook")) {
          return true;
        }

        // Allow auth-related routes
        if (
          pathname.startsWith("/api/auth") ||
          pathname === "/login" ||
          pathname === "/register"
        ) {
          return true;
        }

        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/products")
        ) {
          return true;
        }

        // Admin routes require admin role
        if (pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // Require authentication for all other routes. If there is no token,
        // the user is not authenticated and we return false to block the request.
        return !!token;
      },
    },
  }
);

const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

export { config };
export default withAuth;