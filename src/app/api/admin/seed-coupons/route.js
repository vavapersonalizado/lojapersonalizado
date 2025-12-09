import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const ruleType = 'FIRST_PURCHASE';
        const existing = await prisma.couponRule.findUnique({
            where: { type: ruleType }
        });

        if (!existing) {
            await prisma.couponRule.create({
                data: {
                    type: ruleType,
                    discountType: 'percentage',
                    discountValue: 10, // 10% OFF
                    codePrefix: 'BEMVINDO',
                    expirationDays: 30, // 30 days valid
                    active: true
                }
            });
            return NextResponse.json({ message: 'Regra "Primeira Compra" criada com sucesso!' });
        } else {
            return NextResponse.json({ message: 'Regra "Primeira Compra" já existe.' });
        }
    } catch (error) {
        console.error('Error seeding rules:', error);
        return NextResponse.json({ error: 'Failed to seed rules' }, { status: 500 });
    }
}
