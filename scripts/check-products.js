const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking products...');
    const count = await prisma.product.count();
    console.log(`Total products in DB: ${count}`);

    if (count > 0) {
        const products = await prisma.product.findMany({ take: 3 });
        console.log('Sample products:', products.map(p => ({ id: p.id, name: p.name })));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
