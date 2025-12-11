import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const type = searchParams.get('type') || 'similar';
        const limit = parseInt(searchParams.get('limit') || '4');

        let products = [];

        if (type === 'similar' && productId) {
            // Buscar categoria do produto atual
            const currentProduct = await prisma.product.findUnique({
                where: { id: productId },
                select: { categoryId: true }
            });

            if (currentProduct?.categoryId) {
                products = await prisma.product.findMany({
                    where: {
                        categoryId: currentProduct.categoryId,
                        id: { not: productId },
                        stock: { gt: 0 }
                    },
                    take: limit,
                    include: {
                        category: true,
                        reviews: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
            }
        } else if (type === 'bestsellers') {
            // Produtos com mais reviews ou pedidos (simulado por enquanto)
            products = await prisma.product.findMany({
                where: { stock: { gt: 0 } },
                take: limit,
                include: {
                    category: true,
                    reviews: true
                },
                orderBy: {
                    reviews: {
                        _count: 'desc'
                    }
                }
            });
        } else if (type === 'newest') {
            products = await prisma.product.findMany({
                where: { stock: { gt: 0 } },
                take: limit,
                include: {
                    category: true,
                    reviews: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        // Se não encontrou produtos suficientes, completa com os mais recentes
        if (products.length < limit) {
            const excludeIds = [productId, ...products.map(p => p.id)].filter(Boolean);
            const extraProducts = await prisma.product.findMany({
                where: {
                    id: { notIn: excludeIds },
                    stock: { gt: 0 }
                },
                take: limit - products.length,
                include: {
                    category: true,
                    reviews: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            products = [...products, ...extraProducts];
        }

        // Calcular média de avaliações
        const productsWithRating = products.map(product => ({
            ...product,
            averageRating: product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0,
            reviewCount: product.reviews.length
        }));

        return NextResponse.json(productsWithRating);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json({ error: 'Erro ao buscar recomendações' }, { status: 500 });
    }
}
