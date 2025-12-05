const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('--- Starting Database Diagnostic ---');

    try {
        // 1. Check User Model
        console.log('\n1. Checking User Model...');
        const userCount = await prisma.user.count();
        console.log(`- User count: ${userCount}`);

        // Try to fetch a user with new fields to see if it crashes
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                classification: true, // New field
                deserveDiscount: true // New field
            }
        });
        console.log('- User fetch successful:', user ? 'Yes' : 'No users found');
        if (user) console.log('- Sample User:', user);

        // 2. Check Product Model
        console.log('\n2. Checking Product Model...');
        const productCount = await prisma.product.count();
        console.log(`- Product count: ${productCount}`);

        // Try to fetch products
        const products = await prisma.product.findMany({
            take: 1,
            select: {
                id: true,
                name: true,
                visible: true // Field that might be missing
            }
        });
        console.log('- Product fetch successful:', products.length > 0 ? 'Yes' : 'No products found');

        // 3. Check Coupon Model (New Table)
        console.log('\n3. Checking Coupon Model...');
        try {
            const couponCount = await prisma.coupon.count();
            console.log(`- Coupon count: ${couponCount}`);
        } catch (e) {
            console.error('- Coupon table likely missing:', e.message);
        }

    } catch (error) {
        console.error('\n!!! CRITICAL ERROR !!!');
        console.error('Database check failed. This likely means migrations did not run.');
        console.error('Error details:', error.message);
    } finally {
        await prisma.$disconnect();
        console.log('\n--- Diagnostic Complete ---');
    }
}

checkDatabase();
