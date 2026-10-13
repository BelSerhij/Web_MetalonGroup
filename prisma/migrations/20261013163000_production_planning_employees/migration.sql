CREATE TYPE "EmployeeType" AS ENUM ('PRODUCTION', 'SALES');

CREATE TABLE "Employee" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "employeeType" "EmployeeType" NOT NULL,
  "bonusPerMeter" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Employee_employeeType_isActive_idx" ON "Employee"("employeeType", "isActive");

CREATE TABLE "ProductionShift" (
  "id" TEXT NOT NULL,
  "workDate" DATE NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductionShift_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductionShift_workDate_key" ON "ProductionShift"("workDate");
CREATE INDEX "ProductionShift_workDate_idx" ON "ProductionShift"("workDate");

CREATE TABLE "ProductionShiftEmployee" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "bonusPerMeter" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductionShiftEmployee_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductionShiftEmployee_shiftId_employeeId_key" ON "ProductionShiftEmployee"("shiftId", "employeeId");
CREATE INDEX "ProductionShiftEmployee_employeeId_idx" ON "ProductionShiftEmployee"("employeeId");

CREATE TABLE "ProductionPlan" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "plannedMeters" DECIMAL(12,3) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductionPlan_orderId_key" ON "ProductionPlan"("orderId");
CREATE INDEX "ProductionPlan_shiftId_idx" ON "ProductionPlan"("shiftId");

CREATE TABLE "EmployeePayment" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeePayment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmployeePayment_employeeId_paidAt_idx" ON "EmployeePayment"("employeeId", "paidAt");

ALTER TABLE "Order" ADD COLUMN "salesManagerId" TEXT;
ALTER TABLE "Order" ADD COLUMN "salesBonusPerMeter" DECIMAL(12,2);
ALTER TABLE "Production" ADD COLUMN "shiftId" TEXT;
CREATE INDEX "Order_salesManagerId_idx" ON "Order"("salesManagerId");
CREATE INDEX "Production_shiftId_idx" ON "Production"("shiftId");

ALTER TABLE "ProductionShiftEmployee" ADD CONSTRAINT "ProductionShiftEmployee_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ProductionShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionShiftEmployee" ADD CONSTRAINT "ProductionShiftEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ProductionShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeePayment" ADD CONSTRAINT "EmployeePayment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_salesManagerId_fkey" FOREIGN KEY ("salesManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Production" ADD CONSTRAINT "Production_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ProductionShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
