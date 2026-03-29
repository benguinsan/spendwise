import Link from "next/link"

import { cn } from "@/lib/utils"

type AuthShellProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AuthShell({
  title,
  description,
  children,
  className,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col justify-center bg-gradient-to-b from-muted/40 to-background px-4 py-10 sm:py-16",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-xl font-semibold tracking-tight text-foreground"
          >
            SpendWise
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Expense tracking that stays clear.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
