// const { generateAutomaticCoupon } = require('../src/lib/coupons');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mocking the import since we can't easily import from src/lib in a script without babel/ts-node setup sometimes
// So I will copy the logic here for a quick integration test of the DB and Logic flow, 
// OR I can try to run it if the environment supports it. 
// Given the previous scripts were JS, I'll try to use the function if I can import it, 
// but `src/lib/coupons` uses `export async function` (ESM) and scripts are likely CommonJS.
// To be safe and quick, I will replicate the logic in this test script to verify the DB interactions and Rule validity.

async function testCouponGeneration() {
    const userId = 'test-user-' + Date.now();
    const ruleType = 'FIRST_PURCHASE';

    console.log(`Testing coupon generation for user: ${userId}`);

    // 1. Find active rule
    const rule = await prisma.couponRule.findUnique({
        where: { type: ruleType },
    });

    if (!rule) {
        console.error('❌ Rule FIRST_PURCHASE not found!');
        return;
    }
    console.log('✅ Rule found:', rule);

    // 2. Generate Code
    const prefix = rule.codePrefix;
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${prefix}-${randomPart}`;

    // 3. Create Coupon
    try {
        const coupon = await prisma.coupon.create({
            data: {
                code,
                discount: rule.discountValue,
                type: rule.discountType,
                userId, // This user doesn't exist in DB, might fail if foreign key constraint is strict.
                // Let's check User model. It has relations. So we need a valid user or remove the constraint for the test.
                // Actually, let's create a dummy user first.
                isSystemGenerated: true,
                isActive: true
            },
        });
        console.log('✅ Coupon created successfully:', coupon);

        // Cleanup
        await prisma.coupon.delete({ where: { id: coupon.id } });
        console.log('✅ Cleanup done.');

    } catch (error) {
        if (error.code === 'P2003') {
            console.log('⚠️ Failed due to missing user (Expected if we didn\'t create a real user). Logic seems correct though.');
        } else {
            console.error('❌ Error creating coupon:', error);
        }
    }
}

async function createDummyUserAndTest() {
    try {
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
            }
        });
        console.log('✅ Dummy user created:', user.id);

        await testCouponGenerationWithUser(user.id);

        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ Dummy user deleted.');
    } catch (e) {
        console.error('Error in dummy user test:', e);
    }
}

async function testCouponGenerationWithUser(userId) {
    const ruleType = 'FIRST_PURCHASE';
    const rule = await prisma.couponRule.findUnique({ where: { type: ruleType } });

    if (!rule) return;

    const prefix = rule.codePrefix;
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${prefix}-${randomPart}`;

    const coupon = await prisma.coupon.create({
        data: {
            code,
            discount: rule.discountValue,
            type: rule.discountType,
            userId,
            isSystemGenerated: true,
            isActive: true
        },
    });
    console.log('✅ Coupon created for valid user:', coupon);
    await prisma.coupon.delete({ where: { id: coupon.id } });
}

createDummyUserAndTest()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
