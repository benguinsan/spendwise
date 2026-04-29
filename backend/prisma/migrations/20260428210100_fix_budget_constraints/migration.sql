-- Fix Budget constraints to handle NULL categoryId correctly.
-- PostgreSQL UNIQUE treats NULL as distinct, so the previous composite unique
-- allowed duplicate "overall" budgets where categoryId is NULL.

-- Remove old broad unique index if it exists.
DROP INDEX IF EXISTS "Budget_userId_categoryId_month_year_key";

-- Ensure one budget per (user, category, month, year) for category-specific budgets.
CREATE UNIQUE INDEX "Budget_user_category_month_year_non_null_category_uidx"
ON "Budget"("userId", "categoryId", "month", "year")
WHERE "categoryId" IS NOT NULL;

-- Ensure one "overall" budget per (user, month, year) when category is not set.
CREATE UNIQUE INDEX "Budget_user_month_year_null_category_uidx"
ON "Budget"("userId", "month", "year")
WHERE "categoryId" IS NULL;

-- Guard invalid month values.
ALTER TABLE "Budget"
ADD CONSTRAINT "Budget_month_check" CHECK ("month" BETWEEN 1 AND 12);
