"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
  walletId?: string;
}

interface Wallet {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    walletId: "",
  });

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsData, walletsData] = await Promise.all([
          api.transactions.getByUser(user.id),
          api.wallets.getByUser(user.id),
        ]);
        setTransactions(
          Array.isArray(transactionsData) ? transactionsData : [],
        );
        setWallets(Array.isArray(walletsData) ? walletsData : []);
        if (walletsData?.[0]?.id) {
          setFormData((prev) => ({ ...prev, walletId: walletsData[0].id }));
        }
      } catch (error) {
        addToast(
          `Failed to load data: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, addToast]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const transactionData: Record<string, unknown> = {
        amount: parseFloat(formData.amount),
        note: formData.note,
        date: formData.date,
        userId: user.id,
      };

      let transaction;
      if (formData.type === "income") {
        transaction = await api.transactions.create({
          ...transactionData,
          type: "income",
          walletId: formData.walletId,
        });
      } else if (formData.type === "expense") {
        transaction = await api.transactions.create({
          ...transactionData,
          type: "expense",
          walletId: formData.walletId,
        });
      } else {
        transaction = await api.transactions.create({
          ...transactionData,
          type: "transfer",
          fromWalletId: formData.walletId,
        });
      }

      setTransactions([transaction as Transaction, ...transactions]);
      setFormData({
        type: "expense",
        amount: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
        walletId: wallets[0]?.id || "",
      });
      setShowForm(false);
      addToast("Transaction created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.transactions.delete(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      addToast("Transaction deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Track your income and expenses
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Transaction"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateTransaction}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Wallet</label>
              <select
                value={formData.walletId}
                onChange={(e) =>
                  setFormData({ ...formData, walletId: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Note</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Coffee"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Transaction
          </button>
        </form>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType("income")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "income"
              ? "bg-green-600 text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setFilterType("expense")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "expense"
              ? "bg-red-600 text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => setFilterType("transfer")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === "transfer"
              ? "bg-blue-600 text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Transfer
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            {filterType === "all"
              ? "No transactions yet. Create your first transaction to get started."
              : `No ${filterType} transactions found.`}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Note
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
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
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${
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
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      transaction.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-muted-foreground hover:text-red-600 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
