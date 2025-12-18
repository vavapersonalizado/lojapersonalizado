import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const productCount = await prisma.product.count();
        const userCount = await prisma.user.count();

        console.log('Current counts - Products:', productCount, 'Users:', userCount);

        // 1. Create Categories
        const categories = [
            { name: 'Canecas', slug: 'canecas', visible: true },
            { name: 'Camisetas', slug: 'camisetas', visible: true },
            { name: 'Adesivos', slug: 'adesivos', visible: true },
            { name: 'Brindes', slug: 'brindes', visible: true },
        ];

        let categoriesCreated = 0;
        for (const cat of categories) {
            await prisma.category.upsert({
                where: { slug: cat.slug },
                update: {},
                create: cat,
            });
            categoriesCreated++;
        }

        // 2. Create Admin Users
        const admins = [
            { name: 'Maicon Tsuda', email: 'maicontsuda@gmail.com', role: 'admin' },
            { name: 'Projeto Van Vava', email: 'projetovanvava@gmail.com', role: 'admin' },
        ];

        let adminsCreated = 0;
        for (const admin of admins) {
            await prisma.user.upsert({
                where: { email: admin.email },
                update: { role: 'admin' },
                create: {
                    name: admin.name,
                    email: admin.email,
                    role: 'admin',
                    image: '',
                },
            });
            adminsCreated++;
        }

        // 3. Create Sample Products
        const canecasCat = await prisma.category.findUnique({ where: { slug: 'canecas' } });
        let productsCreated = 0;

        if (canecasCat) {
            const existingProduct = await prisma.product.findFirst({
                where: { name: 'Caneca Personalizada Exemplo' }
            });

            if (!existingProduct) {
                await prisma.product.create({
                    data: {
                        name: 'Caneca Personalizada Exemplo',
                        description: 'Caneca de cerâmica de alta qualidade.',
                        price: 35.00,
                        stock: 100,
                        categoryId: canecasCat.id,
                        images: ['https://placehold.co/600x400?text=Caneca+Exemplo'],
                        isCustomizable: true,
                        sku: 'CAN-001',
                        visible: true
                    }
                });
                productsCreated++;
            }
        }

        // 4. Initialize Site Settings
        await prisma.siteSettings.upsert({
            where: { id: 'settings' },
            update: {},
            create: { id: 'settings' }
        });

        const finalProductCount = await prisma.product.count();
        const finalUserCount = await prisma.user.count();

        return NextResponse.json({
            success: true,
            message: 'Seed completed successfully!',
            stats: {
                categoriesCreated,
                adminsCreated,
                productsCreated,
                before: { products: productCount, users: userCount },
                after: { products: finalProductCount, users: finalUserCount }
            }
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
