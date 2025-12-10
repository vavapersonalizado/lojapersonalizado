import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get users active in the last 5 minutes, excluding admins
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const count = await prisma.onlineUser.count({
            where: {
                lastSeen: {
                    gte: fiveMinutesAgo
                },
                isAdmin: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting online users:', error);
        return NextResponse.json({ error: 'Error counting users' }, { status: 500 });
    }
}
