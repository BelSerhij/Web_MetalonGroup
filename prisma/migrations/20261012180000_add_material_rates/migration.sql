CREATE TABLE "MaterialRate" (
    "id" TEXT NOT NULL,
    "metalBrand" TEXT NOT NULL,
    "thickness" DECIMAL(5,3) NOT NULL,
    "coating" TEXT NOT NULL,
    "paintingType" TEXT NOT NULL,
    "pricePerMeter" DECIMAL(12,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MaterialRate_metalBrand_thickness_coating_paintingType_key"
ON "MaterialRate"("metalBrand", "thickness", "coating", "paintingType");

CREATE INDEX "MaterialRate_metalBrand_thickness_idx"
ON "MaterialRate"("metalBrand", "thickness");
