import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/loyalty - Get current user's points and history
export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const loyalty = await prisma.loyaltyPoints.findUnique({
            where: { userId: session.user.id }
        });

        const history = await prisma.pointsHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({
            points: loyalty?.points || 0,
            tier: loyalty?.tier || 'bronze',
            history: history || []
        });
    } catch (error) {
        console.error('Loyalty fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch loyalty data' },
            { status: 500 }
        );
    }
}

// POST /api/loyalty - Add points (Admin or System only)
// This endpoint is protected and should be called by admin or system events
export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Only admin can manually add points via API
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, points, reason, orderId } = await request.json();

        if (!userId || !points || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update or create LoyaltyPoints
            const loyalty = await tx.loyaltyPoints.upsert({
                where: { userId },
                create: {
                    userId,
                    points: points,
                    tier: 'bronze' // Initial tier
                },
                update: {
                    points: { increment: points }
                }
            });

            // 2. Create History Record
            await tx.pointsHistory.create({
                data: {
                    userId,
                    points,
                    reason,
                    orderId
                }
            });

            // 3. Update Tier based on total points (optional logic)
            // For now, simple tier logic:
            // Bronze: 0-999
            // Silver: 1000-4999
            // Gold: 5000+
            let newTier = loyalty.tier;
            if (loyalty.points >= 5000) newTier = 'gold';
            else if (loyalty.points >= 1000) newTier = 'silver';
            else newTier = 'bronze';

            if (newTier !== loyalty.tier) {
                await tx.loyaltyPoints.update({
                    where: { userId },
                    data: { tier: newTier }
                });
            }

            return loyalty;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Loyalty add error:', error);
        return NextResponse.json(
            { error: 'Failed to add points' },
            { status: 500 }
        );
    }
}
