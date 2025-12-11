import prisma from '@/lib/prisma';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { id } = params;

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        return {
            title: 'Produto não encontrado',
        };
    }

    return {
        title: `${product.name} | Vanessa Yachiro Personalizados`,
        description: product.description || `Compre ${product.name} personalizado na Vanessa Yachiro.`,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images || [],
        },
    };
}

async function getProduct(id) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: true,
        },
    });
    return product;
}

import ProductRecommendations from '@/components/ProductRecommendations';

export default async function ProductPage({ params }) {
    const { id } = params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <>
            <ProductDetails product={product} />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
                <ProductRecommendations
                    productId={product.id}
                    type="similar"
                    title="Produtos Relacionados"
                />
            </div>
        </>
    );
}
