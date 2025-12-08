const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAnalytics() {
    try {
        console.log('Resetting all analytics counters...');

        // Delete all analytics records
        const deleted = await prisma.analytics.deleteMany({});

        console.log(`✅ Deleted ${deleted.count} analytics records`);
        console.log('All analytics counters have been reset!');
    } catch (error) {
        console.error('Error resetting analytics:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAnalytics();
