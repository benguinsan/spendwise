import { cn } from "@/lib/utils"

type FieldProps = {
  id: string
  label: string
  error?: string | null
  children: React.ReactNode
  className?: string
}

export function Field({ id, label, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none text-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type AuthInputProps = React.ComponentProps<"input"> & {
  invalid?: boolean
}

export function AuthInput({ className, invalid, ...props }: AuthInputProps) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-destructive aria-invalid:border-destructive",
        className
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
