"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { AuthInput, Field } from "@/components/auth/field"
import { routes } from "@/lib/routes"

export function SignupForm() {
  const router = useRouter()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setPasswordError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") ?? "").trim()
    const password = String(fd.get("password") ?? "")
    const confirm = String(fd.get("confirm") ?? "")

    if (!email || !password) {
      setFormError("Fill in email and password.")
      return
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.")
      return
    }

    // TODO: replace with API call to your NestJS registration endpoint
    router.push(routes.dashboard)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      <Field id="signup-name" label="Name (optional)">
        <AuthInput
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex"
        />
      </Field>
      <Field id="signup-email" label="Email">
        <AuthInput
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
        />
      </Field>
      <Field id="signup-password" label="Password">
        <AuthInput
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </Field>
      <Field
        id="signup-confirm"
        label="Confirm password"
        error={passwordError}
      >
        <AuthInput
          id="signup-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          required
          minLength={8}
          invalid={!!passwordError}
        />
      </Field>
      <Button type="submit" className="h-10 w-full" size="lg">
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={routes.login}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
