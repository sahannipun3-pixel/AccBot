"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "minimal" | "pill";
}

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-xl border border-border/70 bg-card/50 flex items-center justify-center opacity-60",
          className
        )}
        aria-hidden="true"
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "relative h-9 w-9 rounded-xl border border-border/80 bg-card hover:bg-accent/40 text-foreground transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              variant === "pill" && "rounded-full",
              variant === "minimal" && "border-0 bg-transparent shadow-none hover:bg-white/10",
              className
            )}
            title={`Switch theme (Current: ${theme})`}
            aria-label="Toggle theme"
          >
            <Sun className={cn(
              "h-4 w-4 text-gold transition-all duration-300",
              isDark ? "scale-0 rotate-90 opacity-0 absolute" : "scale-100 rotate-0 opacity-100"
            )} />
            <Moon className={cn(
              "h-4 w-4 text-gold-light transition-all duration-300",
              isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0 absolute"
            )} />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-36 p-1.5 rounded-xl shadow-xl border-border bg-popover">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            theme === "light" ? "bg-gold/15 text-gold font-semibold" : "text-foreground hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-gold" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-gold" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            theme === "dark" ? "bg-gold/15 text-gold font-semibold" : "text-foreground hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-gold-light" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-gold" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            theme === "system" ? "bg-gold/15 text-gold font-semibold" : "text-foreground hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-gold" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
