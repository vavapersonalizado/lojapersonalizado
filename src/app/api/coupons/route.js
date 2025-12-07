import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(coupons);
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json({ error: "Error fetching coupons" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { code, discount, type, maxUses, expiresAt, isActive } = data;

        if (!code || discount === undefined) {
            return NextResponse.json({ error: "Code and discount are required" }, { status: 400 });
        }

        // Check if code already exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code }
        });

        if (existingCoupon) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                discount: parseFloat(discount),
                type: type || 'percentage',
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Error creating coupon" }, { status: 500 });
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.coupon.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return NextResponse.json({ error: "Error deleting coupon" }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { id, code, discount, type, maxUses, expiresAt, isActive } = data;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const updateData = {};
        if (code !== undefined) updateData.code = code;
        if (discount !== undefined) updateData.discount = parseFloat(discount);
        if (type !== undefined) updateData.type = type;
        if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (isActive !== undefined) updateData.isActive = isActive;

        const coupon = await prisma.coupon.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({ error: "Error updating coupon" }, { status: 500 });
    }
}
