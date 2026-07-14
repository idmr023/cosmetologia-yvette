import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.rewrite(new URL("/403", req.url));
    }
    if (path.startsWith("/colaborador") && role !== "colaborador" && role !== "admin") {
      return NextResponse.rewrite(new URL("/403", req.url));
    }
    return NextResponse.next();
  },
  { pages: { signIn: "/login" } },
);

export const config = {
  matcher: ["/admin/:path*", "/colaborador/:path*", "/cliente/:path*"],
};
