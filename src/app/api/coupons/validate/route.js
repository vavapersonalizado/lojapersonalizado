import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Cupom inválido" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: "Limite de uso do cupom atingido" }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discount: coupon.discount,
                type: coupon.type
            }
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "Error validating coupon" }, { status: 500 });
    }
}
