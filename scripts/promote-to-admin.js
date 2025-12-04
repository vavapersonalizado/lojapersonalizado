const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['maicontsuda@gmail.com', 'projetovanvava@gmail.com'];

    console.log('Promoting users to admin...');

    for (const email of emails) {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'admin' }
        });

        console.log(`✅ ${user.email} is now admin`);
    }
}

main()
    .catch(e => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
