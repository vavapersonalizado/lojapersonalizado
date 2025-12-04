const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking database schema...');

    try {
        // Try to query with sku field
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      ORDER BY ordinal_position;
    `;

        console.log('Product table columns:');
        console.log(result);
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
