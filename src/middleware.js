import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdmin = token?.role === "admin";
        const isPartner = token?.role === "partner" || token?.role === "admin";

        // Protect Admin Routes
        if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Protect Partner Routes
        if (req.nextUrl.pathname.startsWith("/partner") && !isPartner) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/partner/:path*"],
};
