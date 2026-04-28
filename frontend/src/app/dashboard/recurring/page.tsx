"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/toast";

interface RecurringTransaction {
  id: string;
  amount: number;
  type: string;
  interval: string;
  nextDate: string;
  isActive: boolean;
  note?: string;
}

interface Wallet {
  id: string;
  name: string;
}

export default function RecurringTransactionsPage() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    interval: "monthly",
    note: "",
    walletId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsData, walletsData] = await Promise.all([
          api.recurringTransactions.getAll(),
          api.wallets.getAll(),
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
  }, [addToast]);

  const handleCreateRecurringTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transaction = await api.recurringTransactions.create({
        amount: parseFloat(formData.amount),
        type: formData.type,
        interval: formData.interval,
        isActive: true,
      });
      setTransactions([...transactions, transaction as RecurringTransaction]);
      setFormData({
        type: "expense",
        amount: "",
        interval: "monthly",
        note: "",
        walletId: wallets[0]?.id || "",
      });
      setShowForm(false);
      addToast("Recurring transaction created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const updated = await api.recurringTransactions.update(id, {
        isActive: !isActive,
      });
      setTransactions(
        transactions.map((t) =>
          t.id === id ? (updated as RecurringTransaction) : t,
        ),
      );
      addToast(
        `Recurring transaction ${!isActive ? "activated" : "deactivated"}`,
        "success",
      );
    } catch (error) {
      addToast(
        `Failed to update recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteRecurringTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring transaction?"))
      return;
    try {
      await api.recurringTransactions.delete(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      addToast("Recurring transaction deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

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
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Set up automatic recurring transactions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Recurring"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateRecurringTransaction}
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
              <label className="block text-sm font-medium mb-2">Interval</label>
              <select
                value={formData.interval}
                onChange={(e) =>
                  setFormData({ ...formData, interval: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
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
              placeholder="e.g., Monthly subscription"
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
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Recurring Transaction
          </button>
        </form>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No recurring transactions yet. Create your first recurring
            transaction to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Recurring
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Interval
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Next Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    {transaction.note || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === "expense"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {transaction.interval}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(transaction.nextDate).toLocaleDateString()}
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
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {transaction.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() =>
                        handleToggleActive(transaction.id, transaction.isActive)
                      }
                      className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                        transaction.isActive
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {transaction.isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteRecurringTransaction(transaction.id)
                      }
                      className="text-xs px-2 py-1 bg-muted hover:bg-red-100 text-red-600 rounded transition-colors font-medium"
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
