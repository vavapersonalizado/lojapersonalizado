const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding production database...');

    // Create a default category
    const category = await prisma.category.upsert({
        where: { slug: 'caneca' },
        update: {},
        create: {
            name: 'CANECA',
            slug: 'caneca',
            visible: true
        }
    });

    console.log('✅ Category created:', category.name);

    // Create a sample product
    const product = await prisma.product.upsert({
        where: { id: 'sample-product-001' },
        update: {},
        create: {
            id: 'sample-product-001',
            name: 'Caneca Personalizada',
            description: 'Caneca personalizada de alta qualidade',
            price: 3500,
            stock: 10,
            images: [],
            categoryId: category.id
        }
    });

    console.log('✅ Product created:', product.name);
    console.log('\n✨ Seeding complete!');
}

main()
    .catch(e => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
