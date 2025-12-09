import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const rules = await prisma.couponRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(rules);
    } catch (error) {
        console.error('Error fetching coupon rules:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { type, discountType, discountValue, codePrefix, expirationDays, active } = data;

        if (!type || !discountValue || !codePrefix) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const rule = await prisma.couponRule.create({
            data: {
                type,
                discountType: discountType || 'percentage',
                discountValue: parseFloat(discountValue),
                codePrefix: codePrefix.toUpperCase(),
                expirationDays: expirationDays ? parseInt(expirationDays) : null,
                active: active !== undefined ? active : true
            }
        });

        return NextResponse.json(rule);
    } catch (error) {
        console.error('Error creating coupon rule:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Rule type already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
