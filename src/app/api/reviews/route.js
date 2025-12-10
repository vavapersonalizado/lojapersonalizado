import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Error fetching reviews' }, { status: 500 });
    }
}

// POST /api/reviews - Create a new review
export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { productId, rating, comment } = body;

        // Validate
        if (!productId || !rating) {
            return NextResponse.json({ error: 'Product ID and rating required' }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId,
                    userId: session.user.id
                }
            }
        });

        if (existingReview) {
            // Update existing review
            const updatedReview = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating: parseInt(rating),
                    comment: comment || null
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return NextResponse.json(updatedReview);
        } else {
            // Create new review
            const review = await prisma.review.create({
                data: {
                    productId,
                    userId: session.user.id,
                    rating: parseInt(rating),
                    comment: comment || null
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return NextResponse.json(review, { status: 201 });
        }
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Error creating review' }, { status: 500 });
    }
}
