import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/notifications - Get user notifications
export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 notifications
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Notifications fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST /api/notifications - Create a notification (Internal use mostly)
export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Only admin or system (via API key potentially) should create notifications directly
    // For now, we allow admins
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, title, message, type, link } = await request.json();

        if (!userId || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || 'info',
                link
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Notification create error:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, all } = await request.json();

        if (all) {
            // Mark all as read for user
            await prisma.notification.updateMany({
                where: { userId: session.user.id, read: false },
                data: { read: true }
            });
            return NextResponse.json({ success: true });
        }

        if (id) {
            // Mark specific notification as read
            // Ensure it belongs to user
            const notification = await prisma.notification.findUnique({
                where: { id }
            });

            if (!notification || notification.userId !== session.user.id) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }

            const updated = await prisma.notification.update({
                where: { id },
                data: { read: true }
            });

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    } catch (error) {
        console.error('Notification update error:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
