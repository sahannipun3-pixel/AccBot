"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "minimal" | "pill" | "dropdown";
}

/**
 * AccBot Theme Toggle
 * Supports exclusively Light Mode (☀️) and Dark Mode (🌙).
 * Desktop / System mode has been completely removed.
 */
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

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-xl border border-border/80 bg-card hover:bg-muted/80 text-foreground transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        variant === "pill" && "rounded-full",
        variant === "minimal" && "border-0 bg-transparent shadow-none hover:bg-muted",
        className
      )}
      title={isDark ? "Switch to Light Mode (☀️)" : "Switch to Dark Mode (🌙)"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <Sun
        className={cn(
          "h-4 w-4 text-gold transition-all duration-300 transform",
          isDark
            ? "scale-0 rotate-90 opacity-0 absolute"
            : "scale-100 rotate-0 opacity-100 text-amber-500"
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 text-gold-light transition-all duration-300 transform",
          isDark
            ? "scale-100 rotate-0 opacity-100 text-gold"
            : "scale-0 -rotate-90 opacity-0 absolute"
        )}
      />
      <span className="sr-only">
        {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </span>
    </button>
  );
}
