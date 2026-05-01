"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

interface Goal {
  id: string;
  name: string;
  description?: string;
  target: number;
  current: number;
  deadline: string;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target: "",
    deadline: "",
  });

  useEffect(() => {
    if (!user?.id) return;

    const loadGoals = async () => {
      try {
        setLoading(true);
        const data = await api.goals.getSummary(user.id);
        setGoals(Array.isArray(data) ? data : []);
      } catch (error) {
        addToast(
          `Failed to load goals: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user?.id, addToast]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const goal = await api.goals.create({
        name: formData.name,
        description: formData.description,
        target: parseFloat(formData.target),
        current: 0,
        deadline: formData.deadline,
        userId: user.id,
      });
      setGoals([...goals, goal as Goal]);
      setFormData({ name: "", description: "", target: "", deadline: "" });
      setShowForm(false);
      addToast("Goal created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create goal: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.goals.delete(id, user.id);
      setGoals(goals.filter((g) => g.id !== id));
      addToast("Goal deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete goal: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleAddProgress = async (goalId: string, amount: number) => {
    if (!user?.id) return;
    try {
      const updatedGoal = await api.goals.updateProgress(goalId, user.id, {
        amount,
      });
      setGoals(goals.map((g) => (g.id === goalId ? (updatedGoal as Goal) : g)));
      addToast("Progress updated successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to update progress: ${error instanceof Error ? error.message : "Unknown error"}`,
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
          <h1 className="text-3xl font-bold">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">
            Plan your financial future
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Goal"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateGoal}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Goal Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Emergency Fund"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 6 months of living expenses"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Amount
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Goal
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No goals yet. Create your first goal to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const progress =
              goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            const daysLeft = goal.deadline
              ? Math.ceil(
                  (new Date(goal.deadline).getTime() - currentTime) /
                    (1000 * 60 * 60 * 24),
                )
              : 0;
            return (
              <div
                key={goal.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      ${goal.current.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      ${goal.target.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% complete</span>
                    {daysLeft > 0 && <span>{daysLeft} days left</span>}
                  </div>
                </div>

                {progress < 100 && (
                  <button
                    onClick={() => handleAddProgress(goal.id, 100)}
                    className="mt-4 w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add $100 progress
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
