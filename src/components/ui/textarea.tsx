import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-input bg-background text-foreground px-3.5 py-3 text-base transition-all outline-none placeholder:text-muted-foreground/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
