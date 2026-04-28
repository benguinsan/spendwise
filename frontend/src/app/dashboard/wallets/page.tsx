"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/toast";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency?: string;
}

export default function WalletsPage() {
  const { addToast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD",
    initialBalance: "",
  });

  useEffect(() => {
    const loadWallets = async () => {
      try {
        setLoading(true);
        const data = await api.wallets.getAll();
        setWallets(Array.isArray(data) ? data : []);
      } catch (error) {
        addToast(
          `Failed to load wallets: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    loadWallets();
  }, [addToast]);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const wallet = await api.wallets.create({
        name: formData.name,
        balance: parseFloat(formData.initialBalance) || 0,
        currency: formData.currency,
      });
      setWallets([...wallets, wallet as Wallet]);
      setFormData({ name: "", currency: "USD", initialBalance: "" });
      setShowForm(false);
      addToast("Wallet created successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to create wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallet?")) return;
    try {
      await api.wallets.delete(id);
      setWallets(wallets.filter((w) => w.id !== id));
      addToast("Wallet deleted successfully!", "success");
    } catch (error) {
      addToast(
        `Failed to delete wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your financial accounts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          {showForm ? "Cancel" : "Add Wallet"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateWallet}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Wallet Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., My Checking Account"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Initial Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) =>
                  setFormData({ ...formData, initialBalance: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Wallet
          </button>
        </form>
      )}

      {wallets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No wallets yet. Create your first wallet to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Create Wallet
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Link
              key={wallet.id}
              href={`/dashboard/wallets/${wallet.id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {wallet.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteWallet(wallet.id);
                  }}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-3xl font-bold">${wallet.balance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {wallet.currency || "USD"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
