CREATE TYPE "CoilPriceUnit" AS ENUM ('PER_KG', 'PER_LINEAR_METER', 'PER_SQUARE_METER');

ALTER TABLE "MetalCoil"
  ADD COLUMN "purchaseUnit" "CoilPriceUnit" NOT NULL DEFAULT 'PER_KG',
  ADD COLUMN "purchaseUnitPrice" DECIMAL(12,2),
  ADD COLUMN "productSlug" TEXT;

UPDATE "MetalCoil"
SET "purchaseUnitPrice" = COALESCE("purchasePricePerKg", "purchasePrice" / NULLIF("initialWeight", 0));

ALTER TABLE "ProductVariant"
  ADD COLUMN "sourceCoilId" TEXT;

CREATE UNIQUE INDEX "ProductVariant_sourceCoilId_key" ON "ProductVariant"("sourceCoilId");

ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_sourceCoilId_fkey"
  FOREIGN KEY ("sourceCoilId") REFERENCES "MetalCoil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PricingSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "manufacturingMarkupPercent" DECIMAL(5,2) NOT NULL DEFAULT 20,
  "partnerMarkupPercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PricingSettings_pkey" PRIMARY KEY ("id")
);
