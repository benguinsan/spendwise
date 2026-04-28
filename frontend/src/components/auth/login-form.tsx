"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AuthInput, Field } from "@/components/auth/field";
import { routes } from "@/lib/routes";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/contexts/toast";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    const password = String(new FormData(form).get("password") ?? "");

    if (!email || !password) {
      setFormError("Enter your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      await login(email, password);
      addToast("Signed in successfully!", "success");
      router.push(routes.dashboard);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setFormError(message);
      addToast(message, "error");
    }
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </Field>
      <Button
        type="submit"
        className="h-10 w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
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
  );
}
