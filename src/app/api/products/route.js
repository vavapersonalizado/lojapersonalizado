import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Force redeploy to regenerate Prisma client after migration
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[API] Fetching products...');
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === 'admin';

        const products = await prisma.product.findMany({
            where: isAdmin ? {} : { visible: true },
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        });
        console.log(`[API] Found ${products.length} products (admin: ${isAdmin})`);
        return NextResponse.json(products);
    } catch (error) {
        console.error("[API] Error fetching products:", error);
        console.error("[API] Error name:", error.name);
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
        return NextResponse.json({
            error: "Error fetching products",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Basic check: only logged in users can create products (expand to admin role check later)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, sku, price, description, categoryId, images, stock, htmlContent } = body;

        // Validate required fields
        if (!name || !price || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Extract URLs from images array (images can be {url, type} or just strings)
        const imageUrls = images?.map(img => typeof img === 'string' ? img : img.url) || [];

        const product = await prisma.product.create({
            data: {
                name,
                sku,
                price: parseFloat(price),
                description,
                categoryId,
                images: imageUrls,
                stock: stock ? parseInt(stock) : 0,
                visible: true, // New products are visible by default
                htmlContent
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Error creating product" }, { status: 500 });
    }
}
