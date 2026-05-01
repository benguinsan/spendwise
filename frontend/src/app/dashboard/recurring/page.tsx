"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";
import {
  RecurringTransaction,
  recurringTransactionService,
} from "@/services/recurring-transaction.service";

interface Wallet {
  id: string;
  name: string;
}

export default function RecurringTransactionsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE" | "TRANSFER",
    amount: "",
    interval: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
    nextDate: new Date().toISOString().split("T")[0],
    note: "",
    walletId: "",
  });

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [transactionsData, walletsData] = await Promise.all([
        api.recurringTransactions.getAll(user.id),
        api.wallets.getByUser(user.id),
      ]);
      setTransactions(
        Array.isArray(transactionsData)
          ? (transactionsData as RecurringTransaction[])
          : [],
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const transaction = await api.recurringTransactions.create({
        type: formData.type,
        amount: parseFloat(formData.amount),
        interval: formData.interval,
        nextDate: formData.nextDate,
        note: formData.note,
        walletId: formData.walletId,
        userId: user.id,
        isActive: true,
      });
      setTransactions([
        transaction as RecurringTransaction,
        ...transactions,
      ]);
      setFormData({
        type: "EXPENSE",
        amount: "",
        interval: "MONTHLY",
        nextDate: new Date().toISOString().split("T")[0],
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingTransaction) return;
    try {
      const updated = await api.recurringTransactions.update(
        editingTransaction.id,
        user.id,
        {
          type: formData.type,
          amount: parseFloat(formData.amount),
          interval: formData.interval,
          nextDate: formData.nextDate,
          note: formData.note,
          walletId: formData.walletId,
        },
      );
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id ? (updated as RecurringTransaction) : t,
        ),
      );
      setFormData({
        type: "EXPENSE",
        amount: "",
        interval: "MONTHLY",
        nextDate: new Date().toISOString().split("T")[0],
        note: "",
        walletId: wallets[0]?.id || "",
      });
      setEditingTransaction(null);
      addToast("Recurring transaction updated successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to update recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    if (!user?.id) return;
    try {
      await api.recurringTransactions.toggle(id, user.id, !isActive);
      setTransactions(
        transactions.map((t) =>
          t.id === id ? { ...t, isActive: !isActive } : t,
        ),
      );
      addToast(
        `Recurring transaction ${!isActive ? "activated" : "deactivated"}`,
        "success",
      );
    } catch (error) {
      addToast(
        `Failed to toggle recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (
      !confirm("Are you sure you want to delete this recurring transaction?")
    )
      return;
    try {
      await api.recurringTransactions.delete(id, user.id);
      setTransactions(transactions.filter((t) => t.id !== id));
      addToast("Recurring transaction deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete recurring transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const startEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      interval: transaction.interval,
      nextDate: transaction.nextDate.split("T")[0],
      note: transaction.note || "",
      walletId: transaction.walletId || "",
    });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setFormData({
      type: "EXPENSE",
      amount: "",
      interval: "MONTHLY",
      nextDate: new Date().toISOString().split("T")[0],
      note: "",
      walletId: wallets[0]?.id || "",
    });
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
            Automate your regular income and expenses
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingTransaction(null);
            setFormData({
              type: "EXPENSE",
              amount: "",
              interval: "MONTHLY",
              nextDate: new Date().toISOString().split("T")[0],
              note: "",
              walletId: wallets[0]?.id || "",
            });
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Recurring Transaction"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "INCOME" | "EXPENSE" | "TRANSFER",
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Interval</label>
              <select
                value={formData.interval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interval: e.target.value as
                      | "DAILY"
                      | "WEEKLY"
                      | "MONTHLY"
                      | "YEARLY",
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Next Date
              </label>
              <input
                type="date"
                value={formData.nextDate}
                onChange={(e) =>
                  setFormData({ ...formData, nextDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
          <div>
            <label className="block text-sm font-medium mb-2">Note</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Netflix subscription"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Recurring Transaction
          </button>
        </form>
      )}

      {editingTransaction && (
        <form
          onSubmit={handleUpdate}
          className="bg-card border border-primary rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Edit Recurring Transaction</h3>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "INCOME" | "EXPENSE" | "TRANSFER",
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
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
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Interval</label>
              <select
                value={formData.interval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interval: e.target.value as
                      | "DAILY"
                      | "WEEKLY"
                      | "MONTHLY"
                      | "YEARLY",
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Next Date
              </label>
              <input
                type="date"
                value={formData.nextDate}
                onChange={(e) =>
                  setFormData({ ...formData, nextDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
          <div>
            <label className="block text-sm font-medium mb-2">Note</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Update Recurring Transaction
          </button>
        </form>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No recurring transactions yet. Create your first one to automate
            your finances.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Recurring Transaction
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Note
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Interval
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Next Date
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    !transaction.isActive ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-sm">
                    {transaction.note || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        transaction.type === "EXPENSE"
                          ? "bg-red-100 text-red-800"
                          : transaction.type === "INCOME"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.type.toLowerCase()}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      transaction.type === "EXPENSE"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {transaction.interval.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(transaction.nextDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleToggle(transaction.id, transaction.isActive)
                      }
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        transaction.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {transaction.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => startEdit(transaction)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
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
