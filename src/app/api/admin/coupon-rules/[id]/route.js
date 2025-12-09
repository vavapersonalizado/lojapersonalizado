import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        const data = await request.json();
        // Prevent updating 'type' if it breaks logic, but for now allow all
        const rule = await prisma.couponRule.update({
            where: { id },
            data: {
                ...data,
                discountValue: data.discountValue ? parseFloat(data.discountValue) : undefined,
                expirationDays: data.expirationDays ? parseInt(data.expirationDays) : undefined
            }
        });
        return NextResponse.json(rule);
    } catch (error) {
        console.error('Error updating coupon rule:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        await prisma.couponRule.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Rule deleted' });
    } catch (error) {
        console.error('Error deleting coupon rule:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
