import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { sessionId, isAdmin } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'SessionId is required' }, { status: 400 });
        }

        // Upsert online user (create or update lastSeen)
        await prisma.onlineUser.upsert({
            where: { sessionId },
            update: { lastSeen: new Date(), isAdmin: isAdmin || false },
            create: { sessionId, isAdmin: isAdmin || false, lastSeen: new Date() }
        });

        // Clean up inactive sessions (older than 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        await prisma.onlineUser.deleteMany({
            where: {
                lastSeen: {
                    lt: fiveMinutesAgo
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in heartbeat:', error);
        return NextResponse.json({ error: 'Error updating presence' }, { status: 500 });
    }
}
