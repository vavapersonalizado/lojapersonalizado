const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'projetovanvava@gmail.com';
    console.log(`Deleting user: ${email}`);

    const deleteUser = await prisma.user.delete({
        where: { email },
    });

    console.log(`Deleted user: ${deleteUser.name} (${deleteUser.email})`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
