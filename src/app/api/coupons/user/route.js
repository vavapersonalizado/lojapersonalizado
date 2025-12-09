import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const coupons = await prisma.coupon.findMany({
            where: {
                userId: session.user.id,
                isActive: true,
                // Optional: Check expiration
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(coupons);
    } catch (error) {
        console.error('Error fetching user coupons:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
