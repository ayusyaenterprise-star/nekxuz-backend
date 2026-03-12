-- AlterTable
ALTER TABLE "Order" ADD COLUMN "buyerAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyerCity" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyerEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyerName" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyerPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyerPincode" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyerState" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingCharges" REAL;
ALTER TABLE "Order" ADD COLUMN "subtotal" REAL;
ALTER TABLE "Order" ADD COLUMN "tax" REAL;
