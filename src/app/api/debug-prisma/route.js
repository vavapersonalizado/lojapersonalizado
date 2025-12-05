import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get Prisma version and schema info
        const info = {
            prismaVersion: require('@prisma/client/package.json').version,
            nodeVersion: process.version,
            env: process.env.NODE_ENV,
        };

        // Try to query a product
        const product = await prisma.product.findFirst();

        return NextResponse.json({
            status: 'ok',
            info,
            productFound: !!product,
            productId: product?.id,
            productFields: product ? Object.keys(product) : []
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
