import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find partner linked to this user
        const partner = await prisma.partner.findUnique({
            where: { userId: session.user.id },
            include: {
                ads: true,
                promotions: true
            }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
        }

        // Fetch analytics for partner's items
        // We need to query the Analytics table for items that belong to this partner
        // Since Analytics stores itemId, we can match it with partner.ads.id and partner.promotions.id

        const adIds = partner.ads.map(ad => ad.id);
        const promoIds = partner.promotions.map(p => p.id);
        const allItemIds = [...adIds, ...promoIds];

        const analytics = await prisma.analytics.findMany({
            where: {
                itemId: { in: allItemIds }
            }
        });

        // Aggregate stats
        const stats = {
            totalViews: 0,
            activeAds: partner.ads.filter(a => a.active).length,
            activePromotions: partner.promotions.filter(p => p.active).length,
            items: []
        };

        // Map analytics back to items
        const itemsWithStats = [
            ...partner.ads.map(ad => ({ ...ad, type: 'ad' })),
            ...partner.promotions.map(p => ({ ...p, type: 'promotion' }))
        ].map(item => {
            const itemStats = analytics.find(a => a.itemId === item.id);
            const views = (itemStats?.views || 0) + (itemStats?.editedViews || 0);
            stats.totalViews += views;
            return {
                id: item.id,
                title: item.title,
                type: item.type,
                active: item.active,
                views: views,
                lastViewed: itemStats?.lastViewedAt || null
            };
        });

        stats.items = itemsWithStats;

        return NextResponse.json({ partner, stats });

    } catch (error) {
        console.error("Error fetching partner stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
