import type { Metadata } from "next";
import { Header } from "@/components/header";
import { DashboardContent } from "@/components/dashboard/content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "SpendWise dashboard - manage your finances",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <DashboardContent />
        </div>
      </main>
    </div>
  );
}
