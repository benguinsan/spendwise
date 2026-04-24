"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/src/components/ui/button"
import { AuthInput, Field } from "@/src/components/auth/field"
import { routes } from "@/lib/routes"

export function LoginForm() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const form = e.currentTarget
    const email = String(new FormData(form).get("email") ?? "").trim()
    const password = String(new FormData(form).get("password") ?? "")

    if (!email || !password) {
      setFormError("Enter your email and password.")
      return
    }

    // TODO: replace with API call to your NestJS auth endpoint
    router.push(routes.dashboard)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      <Field id="login-email" label="Email">
        <AuthInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
        />
      </Field>
      <Field id="login-password" label="Password">
        <AuthInput
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          minLength={8}
        />
      </Field>
      <Button type="submit" className="h-10 w-full" size="lg">
        Sign in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={routes.signup}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  )
}
