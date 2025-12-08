import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const analyticsCount = await prisma.analytics.count();
        // Check if AnalyticsEvent table exists and is accessible
        let eventsCount = 'Unknown';
        try {
            eventsCount = await prisma.analyticsEvent.count();
        } catch (e) {
            eventsCount = `Error: ${e.message}`;
        }

        return NextResponse.json({
            status: 'ok',
            analyticsCount,
            eventsCount,
            env: process.env.NODE_ENV
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
