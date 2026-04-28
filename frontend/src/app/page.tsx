import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Know where your money goes
            </h1>
            <p className="text-xl text-muted-foreground">
              Track expenses with clarity. Manage budgets intelligently. Achieve
              your financial goals.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={routes.signup}>Get started free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={routes.login}>Sign in</Link>
            </Button>
          </div>

          <div className="pt-8">
            <p className="text-sm font-medium text-muted-foreground mb-6">
              Trusted by thousands
            </p>
            <div className="grid grid-cols-3 gap-6 sm:gap-12">
              <Feature number="10K+" label="Active Users" />
              <Feature number="$1M+" label="Tracked Spending" />
              <Feature number="99.9%" label="Uptime" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-2xl font-bold">{number}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
