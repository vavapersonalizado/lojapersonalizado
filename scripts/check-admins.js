const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
    try {
        console.log('Verificando usuários admin no banco...\n');

        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true
            }
        });

        if (admins.length === 0) {
            console.log('❌ Nenhum usuário admin encontrado!');
        } else {
            console.log(`✅ Encontrados ${admins.length} admin(s):\n`);
            admins.forEach(admin => {
                console.log(`  📧 ${admin.email}`);
                console.log(`     Nome: ${admin.name}`);
                console.log(`     Role: ${admin.role}`);
                console.log(`     Email Verificado: ${admin.emailVerified ? 'Sim' : 'Não'}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Erro ao verificar admins:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmins();
