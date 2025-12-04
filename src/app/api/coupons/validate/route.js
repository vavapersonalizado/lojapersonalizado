import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
        }

        return NextResponse.json({
            code: coupon.code,
            discount: coupon.discount,
            type: coupon.type
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "Erro ao validar cupom" }, { status: 500 });
    }
}
