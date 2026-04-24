import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import { routes } from "@/lib/routes"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">SpendWise</span>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={routes.login}>Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={routes.signup}>Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Know where your money goes
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground text-pretty">
          Track expenses with clarity. Sign in or create an account to get
          started.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={routes.signup}>Get started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href={routes.login}>Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
