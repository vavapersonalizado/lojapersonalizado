import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(partners);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching partners' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, logo, link, active } = body;

        const partner = await prisma.partner.create({
            data: {
                name,
                logo,
                link,
                active: active !== undefined ? active : true
            }
        });

        return NextResponse.json(partner);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating partner' }, { status: 500 });
    }
}
