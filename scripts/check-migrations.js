const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking applied migrations...');

    try {
        const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM "_prisma_migrations" 
      ORDER BY finished_at DESC;
    `;

        console.log('Applied migrations:');
        console.log(migrations);
    } catch (error) {
        console.error('Error:', error.message);
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
