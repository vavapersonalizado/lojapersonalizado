import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/analytics/[id] - Editar visualizações
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const body = await request.json();
        const { editedViews } = body;

        if (editedViews === undefined || editedViews === null) {
            return NextResponse.json(
                { error: 'editedViews is required' },
                { status: 400 }
            );
        }

        const updated = await prisma.analytics.update({
            where: { id },
            data: { editedViews: parseInt(editedViews) }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating analytics:', error);
        return NextResponse.json(
            { error: 'Failed to update analytics' },
            { status: 500 }
        );
    }
}
