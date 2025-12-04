const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking product integrity...');
    const products = await prisma.product.findMany({
        include: { category: true }
    });

    console.log(`Found ${products.length} products.`);

    products.forEach(p => {
        console.log(`Product: ${p.name} (${p.id})`);
        console.log(`  Category ID: ${p.categoryId}`);
        console.log(`  Category Loaded: ${p.category ? p.category.name : 'NULL'}`);

        if (p.categoryId && !p.category) {
            console.error('  ERROR: Product has categoryId but Category not found!');
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
