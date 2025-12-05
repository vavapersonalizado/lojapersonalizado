import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        console.log('Fetching product with ID:', id);
        // Force redeploy to regenerate Prisma Client

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        console.log('Product found:', product ? 'Yes' : 'No');

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        console.error("Error details:", error.message, error.stack);
        return NextResponse.json({
            error: "Error fetching product",
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, context) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const body = await request.json();
        const { name, sku, description, price, stock, categoryId } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                sku,
                description,
                price,
                stock,
                categoryId: categoryId || null
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: "Error updating product" }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await context.params;

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
    }
}

export async function PATCH(request, context) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const body = await request.json();
        const { visible } = body;

        const product = await prisma.product.update({
            where: { id },
            data: { visible }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error updating product visibility:", error);
        return NextResponse.json({ error: "Error updating product" }, { status: 500 });
    }
}
