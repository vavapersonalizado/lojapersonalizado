const { PrismaClient } = require('@prisma/client');

const connectionString = "postgresql://neondb_owner:npg_skplIw0B1gSO@ep-falling-wave-ahjhzn8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: connectionString,
        },
    },
});

async function main() {
    try {
        console.log('Fetching products with Prisma Client...');
        const products = await prisma.product.findMany();

        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`- [${p.id}] ${p.name} (Visible: ${p.visible}, Stock: ${p.stock}, CategoryId: ${p.categoryId})`);
        });

    } catch (e) {
        console.error('Error inspecting products:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
