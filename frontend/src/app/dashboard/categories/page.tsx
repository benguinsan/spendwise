"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: "📁",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await api.categories.getAll();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        addToast(
          `Failed to load categories: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [addToast]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const category = await api.categories.create({
        ...formData,
        userId: user.id,
      });
      setCategories([...categories, category as Category]);
      setFormData({ name: "", type: "expense", icon: "📁" });
      setShowForm(false);
      addToast("Category created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const updated = await api.categories.update(editingCategory.id, formData);
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? (updated as Category) : c,
        ),
      );
      setFormData({ name: "", type: "expense", icon: "📁" });
      setEditingCategory(null);
      addToast("Category updated successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || "📁",
    });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: "", type: "expense", icon: "📁" });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.categories.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
      addToast("Category deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const filteredCategories =
    filterType === "all"
      ? categories
      : categories.filter((c) => c.type === filterType);

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
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transactions by category
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingCategory(null);
            setFormData({ name: "", type: "expense", icon: "📁" });
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateCategory}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Groceries"
              />
            </div>
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
              <label className="block text-sm font-medium mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 🛒"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Category
          </button>
        </form>
      )}

      {editingCategory && (
        <form
          onSubmit={handleUpdateCategory}
          className="bg-card border border-primary rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Edit Category</h3>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
              <label className="block text-sm font-medium mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Update Category
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
      </div>

      {filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {filterType === "all"
              ? "No categories yet. Create your first category to get started."
              : `No ${filterType} categories found.`}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card border border-border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {category.type === "income" ? "💰 Income" : "💸 Expense"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(category)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
