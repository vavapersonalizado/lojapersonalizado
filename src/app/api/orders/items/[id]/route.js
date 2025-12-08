import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { ready } = body;

        const orderItem = await prisma.orderItem.update({
            where: { id },
            data: { ready }
        });

        return NextResponse.json(orderItem);
    } catch (error) {
        console.error("Error updating order item:", error);
        return NextResponse.json({ error: "Error updating order item" }, { status: 500 });
    }
}
