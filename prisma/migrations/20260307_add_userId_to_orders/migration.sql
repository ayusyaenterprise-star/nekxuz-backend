-- AddColumn userId to Order table
ALTER TABLE "Order" ADD COLUMN "userId" TEXT;

-- Create index on userId for faster queries
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
