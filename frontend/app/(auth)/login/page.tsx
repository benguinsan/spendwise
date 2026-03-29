import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to SpendWise",
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Sign in to manage your expenses."
    >
      <LoginForm />
    </AuthShell>
  )
}
