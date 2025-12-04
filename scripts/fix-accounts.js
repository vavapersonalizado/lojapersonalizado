const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['maicontsuda@gmail.com', 'projetovanvava@gmail.com'];
    console.log('Fixing accounts for:', emails);

    // Find users first
    const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        include: { accounts: true }
    });

    for (const user of users) {
        console.log(`Processing user: ${user.email}`);
        if (user.accounts.length > 0) {
            console.log(`  Deleting ${user.accounts.length} account(s)...`);
            await prisma.account.deleteMany({
                where: { userId: user.id }
            });
            console.log('  Deleted.');
        } else {
            console.log('  No accounts to delete.');
        }
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
