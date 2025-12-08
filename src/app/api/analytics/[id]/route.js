import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PATCH /api/analytics/[id] - Editar visualizações
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { editedViews } = body;

        console.log('Updating analytics:', { id, editedViews });

        if (editedViews === undefined || editedViews === null) {
            return NextResponse.json(
                { error: 'editedViews is required' },
                { status: 400 }
            );
        }

        const viewsValue = parseInt(editedViews);
        if (isNaN(viewsValue)) {
            return NextResponse.json(
                { error: 'editedViews must be a valid number' },
                { status: 400 }
            );
        }

        const updated = await prisma.analytics.update({
            where: { id },
            data: { editedViews: viewsValue }
        });

        console.log('Analytics updated successfully:', updated);
        revalidatePath('/admin/analytics');
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating analytics:', error);
        console.error('Error details:', error.message, error.stack);
        return NextResponse.json(
            { error: 'Failed to update analytics', details: error.message },
            { status: 500 }
        );
    }
}
