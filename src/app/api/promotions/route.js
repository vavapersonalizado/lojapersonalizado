import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = searchParams.get('admin') === 'true';

        const where = isAdminRequest ? {} : { active: true };

        const promotions = await prisma.promotion.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(promotions);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching promotions' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, imageUrl, discount } = body;

        const promotion = await prisma.promotion.create({
            data: {
                title,
                description,
                imageUrl,
                discount: parseFloat(discount),
                active: true
            }
        });

        return NextResponse.json(promotion);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating promotion' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await prisma.promotion.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting promotion' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, active } = body;

        const promotion = await prisma.promotion.update({
            where: { id },
            data: { active }
        });

        return NextResponse.json(promotion);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating promotion' }, { status: 500 });
    }
}
