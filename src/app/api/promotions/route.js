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
        console.error("Error fetching promotions:", error);
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
        const { title, description, imageUrl, discount, htmlContent, active, images, expiresAt } = body;

        const promotion = await prisma.promotion.create({
            data: {
                title,
                description,
                imageUrl, // Legacy support if needed, or remove if fully migrated to images array
                images: images || [],
                discount: discount ? parseFloat(discount) : null,
                htmlContent,
                active: active !== undefined ? active : true,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Error creating promotion:", error);
        return NextResponse.json({ error: 'Error creating promotion', details: error.message }, { status: 500 });
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
        console.error("Error deleting promotion:", error);
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
        const { id, active, title, description, imageUrl, discount, htmlContent, images, expiresAt } = body;

        const updateData = {};
        if (active !== undefined) updateData.active = active;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (images !== undefined) updateData.images = images;
        if (discount !== undefined) updateData.discount = discount ? parseFloat(discount) : null;
        if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

        const promotion = await prisma.promotion.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Error updating promotion:", error);
        return NextResponse.json({ error: 'Error updating promotion' }, { status: 500 });
    }
}
