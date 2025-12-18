import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/partners - List all partners
export async function GET() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        return NextResponse.json({ error: 'Error fetching partners' }, { status: 500 });
    }
}

// POST /api/partners - Create a new partner
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, link, logo, active } = body;

        const partner = await prisma.partner.create({
            data: {
                name,
                link,
                logo,
                active
            }
        });

        return NextResponse.json(partner);
    } catch (error) {
        console.error('Error creating partner:', error);
        return NextResponse.json({ error: 'Error creating partner' }, { status: 500 });
    }
}

// DELETE /api/partners?id=... - Delete a partner
export async function DELETE(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        await prisma.partner.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting partner:', error);
        return NextResponse.json({ error: 'Error deleting partner' }, { status: 500 });
    }
}
