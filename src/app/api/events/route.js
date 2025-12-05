import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: List all events (public or admin)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = searchParams.get('admin') === 'true';

        const where = isAdminRequest ? {} : { active: true };

        const events = await prisma.event.findMany({
            where,
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
    }
}

// POST: Create new event (Admin only)
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, date, description } = body;

        const event = await prisma.event.create({
            data: {
                title,
                date: new Date(date),
                description,
                active: true
            }
        });

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
    }
}

// DELETE: Remove event (Admin only)
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.event.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting event' }, { status: 500 });
    }
}

// PATCH: Toggle active status (Admin only)
export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, active } = body;

        const event = await prisma.event.update({
            where: { id },
            data: { active }
        });

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
    }
}
