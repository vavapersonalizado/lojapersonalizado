-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "showCategories" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProducts" BOOLEAN NOT NULL DEFAULT true;
