const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ruleType = 'FIRST_PURCHASE';

    const existing = await prisma.couponRule.findUnique({
        where: { type: ruleType }
    });

    if (!existing) {
        await prisma.couponRule.create({
            data: {
                type: ruleType,
                discountType: 'percentage',
                discountValue: 10, // 10% OFF
                codePrefix: 'BEMVINDO',
                expirationDays: 30, // 30 days valid
                active: true
            }
        });
        console.log('Created FIRST_PURCHASE coupon rule.');
    } else {
        console.log('FIRST_PURCHASE rule already exists.');
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
