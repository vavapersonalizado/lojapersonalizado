import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/loyalty/redeem - Redeem points for a coupon
export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rewardId } = await request.json(); // e.g., 'discount_10', 'free_shipping'

        // Define rewards (In a real app, these could be in the DB)
        const REWARDS = {
            'discount_10': { cost: 500, type: 'percentage', value: 10, description: '10% de Desconto' },
            'discount_20': { cost: 1000, type: 'percentage', value: 20, description: '20% de Desconto' },
            'fixed_50': { cost: 2000, type: 'fixed', value: 50, description: 'R$ 50,00 de Desconto' }
        };

        const reward = REWARDS[rewardId];
        if (!reward) {
            return NextResponse.json({ error: 'Invalid reward' }, { status: 400 });
        }

        // Check user points
        const loyalty = await prisma.loyaltyPoints.findUnique({
            where: { userId: session.user.id }
        });

        if (!loyalty || loyalty.points < reward.cost) {
            return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
        }

        // Transaction: Deduct points -> Create Coupon -> Log History
        const result = await prisma.$transaction(async (tx) => {
            // 1. Deduct points
            await tx.loyaltyPoints.update({
                where: { userId: session.user.id },
                data: { points: { decrement: reward.cost } }
            });

            // 2. Create Coupon
            const code = `REWARD-${session.user.id.slice(-4)}-${Date.now().toString().slice(-6)}`;
            const coupon = await tx.coupon.create({
                data: {
                    code: code.toUpperCase(),
                    discount: reward.value,
                    type: reward.type,
                    maxUses: 1,
                    userId: session.user.id,
                    isSystemGenerated: true,
                    isActive: true
                }
            });

            // 3. Log History
            await tx.pointsHistory.create({
                data: {
                    userId: session.user.id,
                    points: -reward.cost,
                    reason: `Resgate: ${reward.description}`
                }
            });

            return coupon;
        });

        return NextResponse.json({ success: true, coupon: result });
    } catch (error) {
        console.error('Redeem error:', error);
        return NextResponse.json(
            { error: 'Failed to redeem points' },
            { status: 500 }
        );
    }
}
