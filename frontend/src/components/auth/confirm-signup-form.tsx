"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AuthInput, Field } from "@/components/auth/field";
import { routes } from "@/lib/routes";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

export function ConfirmSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmSignup, isLoading } = useAuth();
  const { addToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState("");
  const queryEmail = searchParams?.get("email")?.trim() ?? "";
  const email = useMemo(
    () => queryEmail || storedEmail,
    [queryEmail, storedEmail],
  );

  useEffect(() => {
    if (queryEmail) {
      window.sessionStorage.setItem("pendingSignupEmail", queryEmail);
      setStoredEmail(queryEmail);
      return;
    }

    const cachedEmail = window.sessionStorage.getItem("pendingSignupEmail") ?? "";
    if (cachedEmail) {
      setStoredEmail(cachedEmail);
    }
  }, [queryEmail]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const fd = new FormData(e.currentTarget);
    const confirmationCode = String(fd.get("confirmation") ?? "").trim();

    if (!email) {
      setFormError("Missing email. Go back and sign up again.");
      return;
    }

    if (!/^\d{6}$/.test(confirmationCode)) {
      setFormError("Confirmation code must be exactly 6 digits.");
      return;
    }

    try {
      await confirmSignup(email, confirmationCode);
      window.sessionStorage.removeItem("pendingSignupEmail");
      addToast("Account confirmed! Please sign in.", "success");
      router.push(routes.login);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Confirmation failed";
      setFormError(message);
      addToast(message, "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        We sent a confirmation code to <strong>{email || "your email"}</strong>.
        Check your inbox and enter it below.
      </div>
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      <Field id="confirm-email" label="Email">
        <AuthInput
          id="confirm-email"
          name="email"
          type="email"
          value={email}
          readOnly
          disabled
        />
      </Field>
      <Field id="confirmation" label="Confirmation code">
        <AuthInput
          id="confirmation"
          name="confirmation"
          type="text"
          placeholder="Enter 6-digit code"
          inputMode="numeric"
          pattern="\d{6}"
          minLength={6}
          maxLength={6}
          required
          disabled={isLoading}
        />
      </Field>
      <Button
        type="submit"
        className="h-10 w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? "Confirming..." : "Confirm account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link
          href={routes.signup}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up again
        </Link>
      </p>
    </form>
  );
}
