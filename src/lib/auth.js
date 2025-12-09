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
    secret: process.env.NEXTAUTH_SECRET,
    events: {
        async createUser({ user }) {
            // Generate 'First Purchase' coupon when a new user is created
            await generateAutomaticCoupon(user.id, 'FIRST_PURCHASE');
        },
    },
    callbacks: {
        async session({ session, user }) {
            if (session?.user) {
                session.user.id = user.id;
                session.user.role = user.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
    },
};
