import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/src/components/ui/button"
import { routes } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "SpendWise dashboard",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You reached the post-auth screen. Connect the NestJS auth API to
            replace this placeholder.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={routes.login}>Back to sign in</Link>
        </Button>
      </div>
    </div>
  )
}