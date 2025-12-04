const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['maicontsuda@gmail.com', 'projetovanvava@gmail.com'];
    console.log('Inspecting accounts for:', emails);

    const users = await prisma.user.findMany({
        where: {
            email: { in: emails }
        },
        include: {
            accounts: true
        }
    });

    users.forEach(user => {
        console.log('--------------------------------');
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`ID: ${user.id}`);
        if (user.accounts.length === 0) {
            console.log('No accounts linked.');
        } else {
            user.accounts.forEach(acc => {
                console.log(`Account:`);
                console.log(`  ID: ${acc.id}`);
                console.log(`  Provider: ${acc.provider}`);
                console.log(`  ProviderAccountId: ${acc.providerAccountId}`);
                console.log(`  Type: ${acc.type}`);
            });
        }
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
