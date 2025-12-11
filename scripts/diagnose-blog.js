const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Diagnóstico do Blog ---');

    try {
        // 1. Verificar se a tabela BlogPost existe e é acessível
        console.log('1. Testando acesso à tabela BlogPost...');
        const count = await prisma.blogPost.count();
        console.log(`✅ Tabela BlogPost acessível. Total de posts: ${count}`);
    } catch (error) {
        console.error('❌ Erro ao acessar BlogPost:', error.message);
    }

    try {
        // 2. Listar usuários admins
        console.log('\n2. Verificando usuários Admins...');
        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { id: true, email: true, name: true, role: true }
        });

        if (admins.length === 0) {
            console.log('⚠️ Nenhum usuário admin encontrado!');
        } else {
            console.log(`✅ Encontrados ${admins.length} admins:`);
            admins.forEach(admin => console.log(`   - ${admin.email} (${admin.name})`));
        }
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
