const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting production seed...');

    try {
        // 1. Create Categories
        console.log('Creating categories...');
        const categories = [
            { name: 'Canecas', slug: 'canecas', visible: true },
            { name: 'Camisetas', slug: 'camisetas', visible: true },
            { name: 'Adesivos', slug: 'adesivos', visible: true },
            { name: 'Brindes', slug: 'brindes', visible: true },
        ];

        for (const cat of categories) {
            await prisma.category.upsert({
                where: { slug: cat.slug },
                update: {},
                create: cat,
            });
        }
        console.log('Categories created.');

        // 2. Create Admin Users
        console.log('Creating admin users...');
        const admins = [
            { name: 'Maicon Tsuda', email: 'maicontsuda@gmail.com', role: 'admin' },
            { name: 'Projeto Van Vava', email: 'projetovanvava@gmail.com', role: 'admin' },
        ];

        for (const admin of admins) {
            await prisma.user.upsert({
                where: { email: admin.email },
                update: { role: 'admin' },
                create: {
                    name: admin.name,
                    email: admin.email,
                    role: 'admin',
                    image: '', // Placeholder
                },
            });
        }
        console.log('Admin users created.');

        // 3. Create Sample Products
        console.log('Creating sample products...');
        const canecasCat = await prisma.category.findUnique({ where: { slug: 'canecas' } });

        if (canecasCat) {
            try {
                // Create product without SKU first (to avoid client validation error)
                const product = await prisma.product.create({
                    data: {
                        name: 'Caneca Personalizada Exemplo',
                        description: 'Caneca de cerâmica de alta qualidade.',
                        price: 35.00,
                        stock: 100,
                        // visible: true, // Might fail if client is old, rely on DB default
                        categoryId: canecasCat.id,
                        images: ['https://placehold.co/600x400?text=Caneca+Exemplo'],
                    }
                });
                console.log('Product created with ID:', product.id);

                // Update SKU via Raw SQL
                await prisma.$executeRawUnsafe(`
                UPDATE "Product" 
                SET "sku" = 'CAN-001', "visible" = true 
                WHERE "id" = '${product.id}';
            `);
                console.log('Product updated with SKU CAN-001');

            } catch (err) {
                console.error('Error creating product CAN-001:', err);
            }
        } else {
            console.error('Category "canecas" not found, skipping product creation.');
        }

        // 4. Initialize Site Settings
        console.log('Initializing settings...');
        await prisma.siteSettings.upsert({
            where: { id: 'settings' },
            update: {},
            create: { id: 'settings' }
        });
        console.log('Settings initialized.');

        console.log('Seed completed successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
