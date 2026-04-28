import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a SpendWise account",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create account"
      description="Set up your account to start tracking spending."
    >
      <SignupForm />
    </AuthShell>
  );
}
