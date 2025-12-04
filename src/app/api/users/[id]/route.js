import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function PUT(request, context) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const body = await request.json();
        const { classification, discountEligible, discountPercentage, role, notes, phone } = body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                classification,
                discountEligible,
                discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0,
                role,
                notes,
                phone
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}
