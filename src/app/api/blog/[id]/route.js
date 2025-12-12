import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// DELETE /api/blog/[id] - Remover post
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        await prisma.blogPost.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
    }
}
// PATCH /api/blog/[id] - Atualizar post (visibilidade)
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { visible } = body;

        const updateData = {};
        if (visible !== undefined) updateData.visible = visible;

        const post = await prisma.blogPost.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error updating blog post:', error);
        return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
    }
}
