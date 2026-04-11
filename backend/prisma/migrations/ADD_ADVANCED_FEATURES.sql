-- Add missing fields to Goal model (optional enhancements)
ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "notificationSent" BOOLEAN DEFAULT false;
ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing fields to RecurringTransaction
ALTER TABLE "RecurringTransaction" ADD COLUMN IF NOT EXISTS "note" TEXT;
ALTER TABLE "RecurringTransaction" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "RecurringTransaction" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "RecurringTransaction" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS "idx_goal_userId_deadline" ON "Goal"("userId", "deadline");
CREATE INDEX IF NOT EXISTS "idx_goal_currentLessThanTarget" ON "Goal"("current");
CREATE INDEX IF NOT EXISTS "idx_recurring_userId_nextDate_isActive" ON "RecurringTransaction"("userId", "nextDate", "isActive");
CREATE INDEX IF NOT EXISTS "idx_notification_userId_isRead" ON "Notification"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "idx_notification_type" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "idx_tag_userId" ON "Tag"("userId");
CREATE INDEX IF NOT EXISTS "idx_transactionTag_tagId" ON "TransactionTag"("tagId");
CREATE INDEX IF NOT EXISTS "idx_transaction_userId_date" ON "Transaction"("userId", "date");
CREATE INDEX IF NOT EXISTS "idx_transaction_categoryId" ON "Transaction"("categoryId");

-- Create view for goal progress (optional, for analytics)
CREATE OR REPLACE VIEW "v_goal_progress" AS
SELECT 
  g."id",
  g."name",
  g."target",
  g."current",
  g."deadline",
  g."userId",
  ROUND((g."current" / NULLIF(g."target", 0) * 100)::numeric, 2) AS "progress_percentage",
  CASE 
    WHEN g."current" >= g."target" THEN 'REACHED'
    WHEN now() > g."deadline" THEN 'OVERDUE'
    ELSE 'ACTIVE'
  END AS "status"
FROM "Goal" g;

-- Create view for budget summary (optional, for analytics)
CREATE OR REPLACE VIEW "v_budget_summary" AS
SELECT 
  b."id",
  b."userId",
  b."categoryId",
  b."amount" AS "budget_amount",
  COALESCE(SUM(t."amount"), 0) AS "spent_amount",
  ROUND((COALESCE(SUM(t."amount"), 0) / NULLIF(b."amount", 0) * 100)::numeric, 2) AS "spent_percentage",
  b."month",
  b."year"
FROM "Budget" b
LEFT JOIN "Transaction" t ON b."categoryId" = t."categoryId" 
  AND t."userId" = b."userId"
  AND t."type" = 'EXPENSE'
  AND EXTRACT(MONTH FROM t."date") = b."month"
  AND EXTRACT(YEAR FROM t."date") = b."year"
GROUP BY b."id", b."userId", b."categoryId", b."amount", b."month", b."year";
