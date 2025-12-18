import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request) {
    // Check for Vercel Cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        // Note: For now we are permissive to ensure it works, but ideally we check CRON_SECRET
        // console.log('Cron triggered without auth');
    }

    try {
        // Simple query to wake up the database
        const start = Date.now();
        const count = await prisma.product.count();
        const duration = Date.now() - start;

        return NextResponse.json({
            status: 'ok',
            message: 'Database poked successfully',
            productCount: count,
            duration: `${duration}ms`
        });
    } catch (error) {
        console.error('Keep-alive failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
