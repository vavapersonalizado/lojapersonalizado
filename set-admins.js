const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emails = ['maicontsuda@gmail.com', 'projetovanvava@gmail.com'];

    console.log('🔍 Verificando usuários...');

    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            console.log(`✅ Usuário encontrado: ${email}`);
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { role: 'admin' },
            });
            console.log(`👑 ${email} agora é ADMIN!`);
        } else {
            console.log(`❌ Usuário NÃO encontrado: ${email}`);
            console.log(`   -> Peça para o usuário fazer login no site pelo menos uma vez.`);
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
