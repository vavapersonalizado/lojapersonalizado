const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const adminEmails = ['maicontsuda@gmail.com', 'projetovanvava@gmail.com'];

    console.log('Checking admin users...');

    for (const email of adminEmails) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            console.log(`Found user: ${user.email}, Role: ${user.role}`);
            if (user.role !== 'admin') {
                console.log(`Updating ${user.email} to admin...`);
                await prisma.user.update({
                    where: { email },
                    data: { role: 'admin' },
                });
                console.log(`User ${user.email} is now an admin.`);
            } else {
                console.log(`User ${user.email} is already an admin.`);
            }
        } else {
            console.log(`User ${email} not found. Creating as admin...`);
            await prisma.user.create({
                data: {
                    email,
                    name: 'Admin',
                    role: 'admin',
                },
            });
            console.log(`Created admin user: ${email}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
