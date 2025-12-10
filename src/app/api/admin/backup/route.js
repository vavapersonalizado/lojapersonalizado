import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/backup - Exportar todos os dados
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all critical data
        // Using Promise.all for parallel fetching
        const [
            users,
            products,
            categories,
            orders,
            orderItems,
            coupons,
            reviews,
            events,
            promotions,
            ads,
            partners,
            settings
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.product.findMany(),
            prisma.category.findMany(),
            prisma.order.findMany(),
            prisma.orderItem.findMany(),
            prisma.coupon.findMany(),
            prisma.review.findMany(),
            prisma.event.findMany(),
            prisma.promotion.findMany(),
            prisma.ad.findMany(),
            prisma.partner.findMany(),
            prisma.settings.findMany()
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                users,
                products,
                categories,
                orders,
                orderItems,
                coupons,
                reviews,
                events,
                promotions,
                ads,
                partners,
                settings
            }
        };

        return NextResponse.json(backupData);
    } catch (error) {
        console.error('Backup export error:', error);
        return NextResponse.json(
            { error: 'Failed to generate backup' },
            { status: 500 }
        );
    }
}
