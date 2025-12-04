const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'projetovanvava@gmail.com';
    console.log(`Checking data for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            orders: true,
            carts: true
        }
    });

    if (!user) {
        console.log('User not found.');
        return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Orders: ${user.orders.length}`);
    console.log(`Carts: ${user.carts.length}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
