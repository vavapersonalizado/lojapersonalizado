const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rules = await prisma.couponRule.findMany();
    console.log('Coupon Rules:', rules);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
