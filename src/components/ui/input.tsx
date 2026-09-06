import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground font-sans",
        "placeholder:text-muted-foreground/60",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold",
        "hover:border-input/80",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
        "read-only:bg-muted/30 read-only:text-muted-foreground read-only:cursor-default",
        "[&[type=file]]:border-0 [&[type=file]]:bg-transparent [&[type=file]]:p-0 [&[type=file]]:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
