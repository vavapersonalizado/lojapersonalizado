const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Adding visible field to Product table...');

    try {
        // Add visible column with default true
        await prisma.$executeRaw`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "visible" BOOLEAN NOT NULL DEFAULT true;
    `;

        console.log('✅ Successfully added visible field to Product table');

        // Verify the change
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Product' AND column_name = 'visible';
    `;

        console.log('Verification:', result);
    } catch (error) {
        console.error('❌ Error:', error.message);
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
