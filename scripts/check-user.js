const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking users...');
    const users = await prisma.user.findMany({
        include: {
            accounts: true
        }
    });

    console.log(`Found ${users.length} users.`);
    users.forEach(user => {
        console.log('--------------------------------');
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Role: ${user.role}`);
        console.log(`Accounts: ${user.accounts.length}`);
        user.accounts.forEach(acc => {
            console.log(`  - Provider: ${acc.provider}`);
        });
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
