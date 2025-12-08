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
        let sku;
        let isUnique = false;

        // Try to generate a unique SKU up to 5 times
        for (let i = 0; i < 5; i++) {
            // Generate 8 digit number
            const randomNum = Math.floor(10000000 + Math.random() * 90000000);
            sku = randomNum.toString();

            const existingProduct = await prisma.product.findUnique({
                where: { sku }
            });

            if (!existingProduct) {
                isUnique = true;
                break;
            }
        }

        if (!isUnique) {
            return NextResponse.json({ error: "Failed to generate unique SKU" }, { status: 500 });
        }

        return NextResponse.json({ sku });
    } catch (error) {
        console.error("Error generating SKU:", error);
        return NextResponse.json({ error: "Error generating SKU" }, { status: 500 });
    }
}
