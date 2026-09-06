import Link from "next/link";
import { Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 group transition-opacity", className)}
      aria-label="AccBot Sri Lanka Homepage"
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing effect behind icon */}
        <div className="absolute inset-0 bg-gold/20 rounded-xl blur-md scale-75 group-hover:scale-100 transition-transform duration-300" />
        <div className="relative bg-gradient-to-br from-dark-800 to-dark border border-gold/40 text-gold rounded-xl p-2 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-105 shadow-xs">
          <Hexagon className={cn("h-5 w-5 fill-gold/15", iconClassName)} />
          <span className="absolute text-[9px] font-extrabold text-white tracking-wider group-hover:text-gold transition-colors">
            AB
          </span>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={cn(
              "font-heading font-extrabold text-xl tracking-tight text-foreground group-hover:text-gold transition-colors duration-200 leading-none",
              textClassName
            )}
          >
            Acc<span className="text-gold">Bot</span>
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground tracking-widest uppercase mt-1 leading-none">
            Sri Lanka
          </span>
        </div>
      )}
    </Link>
  );
}
