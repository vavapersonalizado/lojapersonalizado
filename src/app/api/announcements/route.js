import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
        const { title, images, link, htmlContent, active, expiresAt } = body;

        const ad = await prisma.ad.create({
            data: {
                title,
                images: images || [],
                link,
                htmlContent,
                active: active !== undefined ? active : true,
                expiresAt: expiresAt ? new Date(expiresAt) : null
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
        const { id, active, title, images, link, htmlContent, expiresAt } = body;

        const updateData = {};
        if (active !== undefined) updateData.active = active;
        if (title !== undefined) updateData.title = title;
        if (images !== undefined) updateData.images = images;
        if (link !== undefined) updateData.link = link;
        if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

        const ad = await prisma.ad.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(ad);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating ad' }, { status: 500 });
    }
}
