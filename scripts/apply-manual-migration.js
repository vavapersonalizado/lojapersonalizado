const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    console.log('Applying manual migration...');

    const sql = fs.readFileSync('scripts/manual-migration.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
        if (statement.trim()) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            await prisma.$executeRawUnsafe(statement);
        }
    }

    console.log('✅ Migration applied successfully!');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
