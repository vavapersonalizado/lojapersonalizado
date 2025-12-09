const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Emails dos administradores
        const adminEmails = [
            { email: 'maicontsuda@gmail.com', name: 'Maicon Tsuda' },
            { email: 'projetovanvava@gmail.com', name: 'Projeto Vava' }
        ];

        console.log('Criando usuários admin...\n');

        for (const admin of adminEmails) {
            console.log(`Processando: ${admin.email}...`);

            // Verifica se o usuário já existe
            const existingUser = await prisma.user.findUnique({
                where: { email: admin.email }
            });

            if (existingUser) {
                console.log('  → Usuário já existe! Atualizando para admin...');
                await prisma.user.update({
                    where: { email: admin.email },
                    data: { role: 'admin' }
                });
                console.log('  ✅ Atualizado para admin\n');
            } else {
                console.log('  → Criando novo usuário admin...');
                await prisma.user.create({
                    data: {
                        email: admin.email,
                        name: admin.name,
                        role: 'admin',
                        emailVerified: new Date(),
                        birthDate: null
                    }
                });
                console.log('  ✅ Usuário admin criado\n');
            }
        }

        console.log('🎉 Sucesso! Todos os admins foram configurados.');
        console.log('📌 Emails admin:');
        adminEmails.forEach(admin => console.log(`   - ${admin.email}`));

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
