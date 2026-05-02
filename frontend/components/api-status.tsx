"use client";

import { useEffect, useState } from "react";
import { testAPIConnection } from "@/lib/api-test";

export function APIStatus() {
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
  }>({
    loading: true,
    success: false,
    message: "Checking API connection...",
  });

  useEffect(() => {
    testAPIConnection().then((result) => {
      setStatus({
        loading: false,
        success: result.success,
        message: result.message,
      });
    });
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg p-3 shadow-lg ${
        status.loading
          ? "bg-blue-500"
          : status.success
            ? "bg-green-500"
            : "bg-red-500"
      } text-white text-sm max-w-xs`}
    >
      <div className="flex items-center gap-2">
        {status.loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : status.success ? (
          <span>✅</span>
        ) : (
          <span>❌</span>
        )}
        <span>{status.message}</span>
      </div>
    </div>
  );
}
