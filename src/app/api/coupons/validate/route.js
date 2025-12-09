import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { code, cartItems } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code },
            include: { category: true } // Include category info
        });

        if (!coupon) {
            return NextResponse.json({ error: "Cupom inválido" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: "Limite de uso do cupom atingido" }, { status: 400 });
        }

        // --- User Validation ---
        if (coupon.userId) {
            const { getServerSession } = await import("next-auth/next");
            const { authOptions } = await import("@/lib/auth");
            const session = await getServerSession(authOptions);

            if (!session || session.user.id !== coupon.userId) {
                return NextResponse.json({ error: "Este cupom não é válido para você." }, { status: 403 });
            }
        }

        // --- Bundle/Quantity Validation ---
        if (coupon.minQuantity > 1) {
            if (!cartItems || !Array.isArray(cartItems)) {
                return NextResponse.json({ error: "Carrinho vazio ou inválido para validação" }, { status: 400 });
            }

            let eligibleQuantity = 0;

            if (coupon.productId) {
                // Count specific product
                const item = cartItems.find(i => i.id === coupon.productId || i.productId === coupon.productId);
                eligibleQuantity = item ? item.quantity : 0;
            } else if (coupon.categoryId) {
                // Count items in category (Need to fetch product categories if not in cartItems)
                // Assuming cartItems might not have categoryId, we might need to fetch products.
                // Optimally, cartItems should have categoryId. If not, we fetch.
                // For now, let's fetch product details to be safe.
                const productIds = cartItems.map(i => i.id || i.productId);
                const products = await prisma.product.findMany({
                    where: { id: { in: productIds }, categoryId: coupon.categoryId },
                    select: { id: true }
                });
                const eligibleProductIds = products.map(p => p.id);
                eligibleQuantity = cartItems
                    .filter(i => eligibleProductIds.includes(i.id || i.productId))
                    .reduce((sum, i) => sum + i.quantity, 0);
            } else {
                // Count total items
                eligibleQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
            }

            if (eligibleQuantity < coupon.minQuantity) {
                return NextResponse.json({
                    error: `Adicione pelo menos ${coupon.minQuantity} itens elegíveis para usar este cupom.`
                }, { status: 400 });
            }
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discount: coupon.discount,
                type: coupon.type,
                productId: coupon.productId,
                categoryId: coupon.categoryId,
                minQuantity: coupon.minQuantity,
                cumulative: coupon.cumulative
            }
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "Error validating coupon" }, { status: 500 });
    }
}
