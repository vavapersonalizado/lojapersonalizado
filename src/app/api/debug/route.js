import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check DB connection
        await prisma.$queryRaw`SELECT 1`;

        // 2. Check Product table columns
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Product';
        `;

        // 3. Try to fetch one product and counts
        const product = await prisma.product.findFirst();
        const productCount = await prisma.product.count();
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: 'ok',
            dbConnection: 'success',
            counts: {
                products: productCount,
                users: userCount
            },
            columns: columns,
            sampleProduct: product
        });
    } catch (error) {
        console.error('Debug Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
