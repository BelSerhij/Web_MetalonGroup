ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'OVERPAID';
ALTER TABLE "Order" ADD COLUMN "deliveryService" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;
CREATE TABLE "OrderManualItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'шт.',
  "quantity" DECIMAL(12,3) NOT NULL,
  "length" DECIMAL(10,3),
  "purchasePrice" DECIMAL(14,2),
  "price" DECIMAL(14,2) NOT NULL,
  "total" DECIMAL(14,2) NOT NULL,
  "purchaseStatus" TEXT NOT NULL DEFAULT 'NEEDS_ORDER',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderManualItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderManualItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "OrderManualItem_orderId_idx" ON "OrderManualItem"("orderId");
CREATE INDEX "OrderManualItem_purchaseStatus_idx" ON "OrderManualItem"("purchaseStatus");
