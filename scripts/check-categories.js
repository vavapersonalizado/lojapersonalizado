const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking categories...');
    const count = await prisma.category.count();
    console.log(`Total categories: ${count}`);

    if (count > 0) {
        const categories = await prisma.category.findMany();
        console.log('Categories:', categories);
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
