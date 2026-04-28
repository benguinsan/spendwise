import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
