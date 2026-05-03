"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";
import { APIError } from "@/lib/api-client";

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  note?: string | null;
  category?: { id: string; name: string; icon?: string | null } | null;
}

interface WalletDetail {
  id: string;
  name: string;
  balance: number;
  currency: string;
  userId: string;
  user: { id: string; email: string; name?: string | null };
  transactionsFrom: WalletTransaction[];
  transactionsTo: WalletTransaction[];
}

export default function WalletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();
  const { addToast } = useToast();
  const [wallet, setWallet] = useState<WalletDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletId || !user?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const data = (await api.wallets.getOne(walletId)) as WalletDetail;
        if (data.user?.id && data.user.id !== user.id) {
          addToast("This wallet does not belong to your account.", "error");
          router.replace("/dashboard/wallets");
          return;
        }
        setWallet(data);
      } catch (err) {
        const msg =
          err instanceof APIError && err.status === 404
            ? "Wallet not found."
            : err instanceof Error
              ? err.message
              : "Failed to load wallet.";
        addToast(msg, "error");
        router.replace("/dashboard/wallets");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [walletId, user?.id, addToast, router]);

  if (!walletId) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!wallet) {
    return null;
  }

  const from = wallet.transactionsFrom ?? [];
  const to = wallet.transactionsTo ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/wallets"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Wallets
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-bold">{wallet.name}</h1>
        <p className="text-muted-foreground mt-1">
          {wallet.currency || "USD"} · Balance
        </p>
        <p className="text-4xl font-bold mt-4">
          ${Number(wallet.balance).toFixed(2)}
        </p>
      </div>

      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">Recent outflows</h2>
        {from.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {from.map((t) => (
              <li
                key={t.id}
                className="flex justify-between gap-4 text-sm border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <span className="text-muted-foreground">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                  {t.category && (
                    <span className="ml-2">
                      {t.category.icon} {t.category.name}
                    </span>
                  )}
                  {t.note && (
                    <p className="text-muted-foreground mt-1">{t.note}</p>
                  )}
                </div>
                <span className="font-medium shrink-0 text-red-600">
                  −${Number(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">Recent inflows (to wallet)</h2>
        {to.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="space-y-3">
            {to.map((t) => (
              <li
                key={t.id}
                className="flex justify-between gap-4 text-sm border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <span className="text-muted-foreground">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                  {t.note && (
                    <p className="text-muted-foreground mt-1">{t.note}</p>
                  )}
                </div>
                <span className="font-medium shrink-0 text-green-600">
                  +${Number(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
