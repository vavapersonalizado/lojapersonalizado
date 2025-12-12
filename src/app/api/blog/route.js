import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/blog - Listar posts
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === 'admin';

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        const where = {};
        if (!isAdmin) {
            where.visible = true;
        }

        const posts = await prisma.blogPost.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const total = await prisma.blogPost.count({ where });

        return NextResponse.json({
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
    }
}

// POST /api/blog - Criar novo post
export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { embedUrl, title } = body;

        if (!embedUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Detect platform
        let platform = 'OTHER';
        if (embedUrl.includes('instagram.com')) platform = 'INSTAGRAM';
        else if (embedUrl.includes('facebook.com')) platform = 'FACEBOOK';
        else if (embedUrl.includes('pinterest.com') || embedUrl.includes('pin.it')) platform = 'PINTEREST';

        const post = await prisma.blogPost.create({
            data: {
                embedUrl,
                title,
                platform
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
    }
}

