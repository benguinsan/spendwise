"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/toast";

interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
}

export default function BudgetsPage() {
  const { addToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const budgetsData = await api.budgets.getAll();
        setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
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

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budget = await api.budgets.create({
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: formData.year,
      });
      setBudgets([...budgets, budget as Budget]);
      setFormData({
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      setShowForm(false);
      addToast("Budget created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create budget: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      await api.budgets.delete(id);
      setBudgets(budgets.filter((b) => b.id !== id));
      addToast("Budget deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete budget: ${error instanceof Error ? error.message : "Unknown error"}`,
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
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Set and track spending limits
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Budget"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateBudget}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium mb-2">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Budget
          </button>
        </form>
      )}

      {budgets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No budgets yet. Create your first budget to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Budget
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const monthName = new Date(
                  budget.year,
                  budget.month - 1,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <tr
                    key={budget.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">{monthName}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      ${budget.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-muted-foreground hover:text-red-600 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
