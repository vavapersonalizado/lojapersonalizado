-- Add sku column to Product table
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");

-- Add classification fields to User table  
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "classification" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "discountEligible" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "discountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add cumulative and productId to Coupon table
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "cumulative" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "productId" TEXT;
