import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    try {
        const now = new Date();

        // Build query conditions
        const whereClause = {
            isActive: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } }
            ],
            // Coupons must be either public (userId: null) OR assigned to this user
            AND: [
                {
                    OR: [
                        { userId: null },
                        { userId: userId }
                    ]
                }
            ]
        };

        // If user is not logged in, only fetch public coupons (userId: null)
        if (!userId) {
            whereClause.AND = [{ userId: null }];
        }

        const coupons = await prisma.coupon.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Filter out coupons that have reached max uses (if applicable)
        // Note: Ideally maxUses check should be atomic or handled better, but for listing this is okay.
        const validCoupons = coupons.filter(coupon => {
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                return false;
            }
            return true;
        });

        return NextResponse.json(validCoupons);
    } catch (error) {
        console.error("Error fetching available coupons:", error);
        return NextResponse.json({ error: "Error fetching coupons" }, { status: 500 });
    }
}
