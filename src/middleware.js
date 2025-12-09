import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdmin = token?.role === "admin";
        const isPartner = token?.role === "partner" || token?.role === "admin"; // Admins can access partner area too for debug? Or maybe not.

        // Protect Admin Routes
        if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Protect Partner Routes
        // Note: We might want to allow admins to see partner dashboard too, or strictly partners.
        // For now, let's say only partners (role='partner') or admins can access.
        if (req.nextUrl.pathname.startsWith("/partner") && !isPartner) {
            // If user is logged in but not a partner, redirect to home or apply for partnership page
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
