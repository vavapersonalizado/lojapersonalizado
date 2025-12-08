const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugUpdate() {
    try {
        console.log('Fetching an analytics record...');
        const record = await prisma.analytics.findFirst();

        if (!record) {
            console.log('No analytics records found to test.');
            return;
        }

        console.log('Found record:', record);
        console.log('Attempting to update editedViews...');

        const updated = await prisma.analytics.update({
            where: { id: record.id },
            data: { editedViews: 999 }
        });

        console.log('Update successful:', updated);
    } catch (error) {
        console.error('Update FAILED:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugUpdate();
