import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const setting = await prisma.settings.findUnique({
            where: { key: 'analytics_order' }
        });

        // Default order if not set
        const defaultOrder = ['page', 'event', 'product', 'promotion', 'ad', 'partner', 'coupon'];

        let order = defaultOrder;
        if (setting && setting.value) {
            try {
                order = JSON.parse(setting.value);
            } catch (e) {
                console.error('Error parsing analytics order:', e);
            }
        }

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { order } = body;

        if (!Array.isArray(order)) {
            return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
        }

        const setting = await prisma.settings.upsert({
            where: { key: 'analytics_order' },
            update: { value: JSON.stringify(order) },
            create: { key: 'analytics_order', value: JSON.stringify(order) }
        });

        return NextResponse.json({ order: JSON.parse(setting.value) });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
