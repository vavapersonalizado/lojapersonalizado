import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

import { generateAutomaticCoupon } from "@/lib/coupons";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    session: {
        strategy: "jwt", // Force JWT strategy for middleware compatibility
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    debug: true, // Enable debug mode
    events: {
        async createUser({ user }) {
            try {
                // Generate 'First Purchase' coupon when a new user is created
                await generateAutomaticCoupon(user.id, 'FIRST_PURCHASE');
            } catch (error) {
                console.error("Error in createUser event (coupon generation):", error);
                // Don't block user creation/login if coupon generation fails
            }
        },
    },
    callbacks: {
        async session({ session, token }) {
            // With JWT strategy, we get token instead of user
            if (session?.user && token) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user, trigger }) {
            // On sign in, add user info to token
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            // On update, refresh user data from database
            if (trigger === "update") {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { role: true }
                });
                if (dbUser) {
                    token.role = dbUser.role;
                }
            }

            return token;
        },
    },
};
