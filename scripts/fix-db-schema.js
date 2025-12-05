const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting database schema fix...');

    try {
        // 1. Fix Product table
        console.log('Fixing Product table...');
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "sku" TEXT;`);
            console.log('Added sku column to Product');
        } catch (e) {
            console.log('sku column might already exist:', e.message.split('\n')[0]);
        }

        try {
            await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");`);
            console.log('Added unique index for sku');
        } catch (e) {
            console.log('sku index might already exist');
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "visible" BOOLEAN NOT NULL DEFAULT true;`);
            console.log('Added visible column to Product');
        } catch (e) {
            console.log('visible column might already exist:', e.message.split('\n')[0]);
        }

        // 2. Fix User table
        console.log('Fixing User table...');
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "classification" TEXT;`);
            console.log('Added classification column to User');
        } catch (e) {
            console.log('classification column might already exist');
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "discountEligible" BOOLEAN NOT NULL DEFAULT false;`);
            console.log('Added discountEligible column to User');
        } catch (e) {
            console.log('discountEligible column might already exist');
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "discountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0;`);
            console.log('Added discountPercentage column to User');
        } catch (e) {
            console.log('discountPercentage column might already exist');
        }

        // 3. Create Coupon table if missing (simplified check)
        console.log('Checking Coupon table...');
        try {
            await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Coupon" (
                "id" TEXT NOT NULL,
                "code" TEXT NOT NULL,
                "discount" DOUBLE PRECISION NOT NULL,
                "type" TEXT NOT NULL DEFAULT 'percentage',
                "maxUses" INTEGER,
                "usedCount" INTEGER NOT NULL DEFAULT 0,
                "expiresAt" TIMESTAMP(3),
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "cumulative" BOOLEAN NOT NULL DEFAULT true,
                "productId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
            );
        `);
            console.log('Ensured Coupon table exists');

            try {
                await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");`);
                console.log('Ensured Coupon code index exists');
            } catch (e) {
                // Index might exist
            }
        } catch (e) {
            console.error('Error creating Coupon table:', e);
        }

        console.log('Database schema fix completed.');
    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
