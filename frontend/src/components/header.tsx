"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { routes } from "@/lib/routes";

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(routes.home);
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-4 mb-0">
          <Link
            href={routes.home}
            className="text-lg font-semibold tracking-tight"
          >
            SpendWise
          </Link>
          <nav className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.name || user.email}
                </span>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={routes.login}>Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={routes.signup}>Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>

        {/* Dashboard Navigation */}
        {isAuthenticated && user && (
          <nav className="flex gap-1 py-3 overflow-x-auto border-t border-border/50">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/dashboard/wallets" label="Wallets" />
            <NavLink href="/dashboard/transactions" label="Transactions" />
            <NavLink href="/dashboard/categories" label="Categories" />
            <NavLink href="/dashboard/budgets" label="Budgets" />
            <NavLink href="/dashboard/goals" label="Goals" />
            <NavLink href="/dashboard/tags" label="Tags" />
            <NavLink href="/dashboard/recurring" label="Recurring" />
            <NavLink href="/dashboard/notifications" label="Notifications" />
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
