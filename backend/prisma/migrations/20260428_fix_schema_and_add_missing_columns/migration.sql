-- Add missing updated_at to wallets
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing updated_at to budgets
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Rename wallet_id to from_wallet_id in transactions to support transfers
ALTER TABLE "transactions" RENAME COLUMN "wallet_id" TO "from_wallet_id";

-- Add to_wallet_id column for transfers
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "to_wallet_id" TEXT;

-- Rename old foreign key constraint
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_wallet_id_fkey";

-- Add new foreign key for from_wallet_id
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_wallet_id_fkey" 
FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add foreign key for to_wallet_id
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_wallet_id_fkey" 
FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("wallet_id") ON DELETE SET NULL ON UPDATE CASCADE;
