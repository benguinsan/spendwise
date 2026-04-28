-- CreateTable Goal
CREATE TABLE IF NOT EXISTS "goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target" DOUBLE PRECISION NOT NULL,
    "current" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable Tag
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransactionTag
CREATE TABLE IF NOT EXISTS "transaction_tags" (
    "transaction_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "transaction_tags_pkey" PRIMARY KEY ("transaction_id","tag_id")
);

-- CreateTable Notification
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable RecurringTransaction
CREATE TABLE IF NOT EXISTS "recurring_transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "interval" TEXT NOT NULL,
    "next_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex Goal
CREATE INDEX IF NOT EXISTS "goals_user_id_deadline_idx" ON "goals"("user_id", "deadline");

-- CreateIndex Tag
CREATE UNIQUE INDEX IF NOT EXISTS "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex Notification
CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");

-- CreateIndex RecurringTransaction
CREATE INDEX IF NOT EXISTS "recurring_transactions_user_id_next_date_is_active_idx" ON "recurring_transactions"("user_id", "next_date", "is_active");

-- AddForeignKey Goal
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Tag
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey TransactionTag
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_fkey" 
FOREIGN KEY ("transaction_id") REFERENCES "transactions"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_fkey" 
FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Notification
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey RecurringTransaction
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_wallet_id_fkey" 
FOREIGN KEY ("wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_fkey" 
FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;
