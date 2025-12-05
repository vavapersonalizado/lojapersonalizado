const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create/Update Admin User
    const adminEmail = 'maicontsuda@gmail.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'admin',
            classification: 'Admin',
            deserveDiscount: true,
            discountType: 'percentage',
            discountValue: 100
        },
        create: {
            email: adminEmail,
            name: 'Maicon Tsuda',
            role: 'admin',
            classification: 'Admin',
            deserveDiscount: true,
            discountType: 'percentage',
            discountValue: 100
        },
    });
    console.log(`✅ Admin user configured: ${admin.email}`);

    // 2. Create Categories
    const categories = [
        { name: 'Canecas', slug: 'canecas' },
        { name: 'Camisetas', slug: 'camisetas' },
        { name: 'Adesivos', slug: 'adesivos' },
        { name: 'Digitais', slug: 'digitais' },
        { name: 'Outros', slug: 'outros' }
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }
    console.log(`✅ ${categories.length} categories verified`);

    // 3. Create Sample Product (if none exist)
    const productCount = await prisma.product.count();
    if (productCount === 0) {
        const canecasCategory = await prisma.category.findUnique({ where: { slug: 'canecas' } });
        if (canecasCategory) {
            await prisma.product.create({
                data: {
                    name: 'Caneca Personalizada Exemplo',
                    description: 'Uma caneca incrível para teste.',
                    price: 35.90,
                    sku: 'CAN-001',
                    stock: 10,
                    visible: true,
                    categoryId: canecasCategory.id,
                    images: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg']
                }
            });
            console.log('✅ Sample product created');
        }
    }

    console.log('🏁 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
