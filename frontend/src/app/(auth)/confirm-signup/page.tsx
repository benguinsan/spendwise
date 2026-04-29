import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ConfirmSignupForm } from "@/components/auth/confirm-signup-form";

export const metadata: Metadata = {
  title: "Confirm account",
  description: "Confirm your SpendWise account",
};

export default function ConfirmSignupPage() {
  return (
    <AuthShell
      title="Confirm account"
      description="Enter the verification code sent to your email."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <ConfirmSignupForm />
      </Suspense>
    </AuthShell>
  );
}
