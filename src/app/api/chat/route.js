import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/chat - Get messages for current user (or all for admin)
export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let where = {};

        if (session.user.role === 'admin') {
            // Admin can see all messages or filter by user
            if (userId) {
                where = { userId };
            }
        } else {
            // Regular user can only see their own messages
            where = { userId: session.user.id };
        }

        const messages = await prisma.chatMessage.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Chat fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/chat - Send a message
export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { message, userId } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        let data = {
            message,
            isAdmin: session.user.role === 'admin',
            read: false
        };

        if (session.user.role === 'admin') {
            // Admin sending to a user
            if (!userId) {
                return NextResponse.json({ error: 'UserId is required for admin messages' }, { status: 400 });
            }
            data.userId = userId;
            data.adminId = session.user.id;
        } else {
            // User sending to admin
            data.userId = session.user.id;
        }

        const newMessage = await prisma.chatMessage.create({
            data
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('Chat send error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
