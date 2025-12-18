const { PrismaClient } = require('@prisma/client');

const connectionString = "postgresql://neondb_owner:npg_skplIw0B1gSO@ep-falling-wave-ahjhzn8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('Using hardcoded connection string:', connectionString);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: connectionString,
        },
    },
});

async function checkData() {
    try {
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();
        console.log(`Users: ${userCount}`);
        console.log(`Products: ${productCount}`);
    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
