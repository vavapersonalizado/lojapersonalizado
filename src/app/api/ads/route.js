import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = searchParams.get('admin') === 'true';

        const where = isAdminRequest ? {} : { active: true };

        const ads = await prisma.ad.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(ads);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching ads' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, images, link } = body;

        const ad = await prisma.ad.create({
            data: {
                title,
                images: images || [],
                link,
                active: true
            }
        });

        return NextResponse.json(ad);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating ad' }, { status: 500 });
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

        await prisma.ad.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting ad' }, { status: 500 });
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

        const ad = await prisma.ad.update({
            where: { id },
            data: { active }
        });

        return NextResponse.json(ad);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating ad' }, { status: 500 });
    }
}
