"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/toast";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
  walletId?: string;
}

export function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [walletsData, transactionsData] = await Promise.all([
          api.wallets.getByUser(user.id).catch(() => []),
          api.transactions.getByUser(user.id).catch(() => []),
        ]);

        setWallets(Array.isArray(walletsData) ? walletsData : []);
        setTransactions(
          Array.isArray(transactionsData) ? transactionsData : [],
        );
      } catch (error) {
        addToast(
          `Failed to load dashboard data: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [authLoading, user?.id, addToast]);

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + (wallet.balance || 0),
    0,
  );
  const recentTransactions = transactions.slice(0, 5);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-lg border border-border bg-muted animate-pulse" />
        <div className="h-64 rounded-lg border border-border bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || user?.email}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your financial activity.
        </p>
      </div>

      {/* Balance Card */}
      <div className="rounded-lg border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <p className="text-sm font-medium text-muted-foreground">
          Total Balance
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight">
          ${totalBalance.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Across {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Wallets" value={wallets.length.toString()} />
        <StatCard
          label="Total Transactions"
          value={transactions.length.toString()}
        />
        <StatCard label="This Month" value="Coming soon" />
        <StatCard label="This Week" value="Coming soon" />
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your latest financial activities
          </p>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">
              No transactions yet. Start by adding a wallet or transaction.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.note || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === "expense"
                            ? "bg-red-100 text-red-800"
                            : transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <span
                        className={
                          transaction.type === "expense"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {transaction.type === "expense" ? "-" : "+"}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recentTransactions.length > 0 && (
          <div className="text-center">
            <Link
              href="/dashboard/transactions"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all transactions →
            </Link>
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      <div className="rounded-lg border border-border bg-blue-50/50 p-6">
        <h3 className="font-semibold text-blue-900">Getting Started</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>✓ Create or import wallets to track your money</li>
          <li>✓ Add transactions to monitor your spending</li>
          <li>✓ Set budgets to manage expenses by category</li>
          <li>✓ Create financial goals to plan for the future</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
