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
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing effect behind icon */}
        <div className="absolute inset-0 bg-gold/20 rounded-xl blur-md scale-75 group-hover:scale-100 transition-transform duration-300" />
        <div className="relative bg-dark-800 border border-gold/40 text-gold rounded-xl p-2 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:scale-105">
          <Hexagon className={cn("h-5 w-5 fill-gold/10", iconClassName)} />
          <span className="absolute text-[9px] font-bold text-white tracking-wider group-hover:text-gold transition-colors">
            AB
          </span>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-heading font-bold text-xl tracking-tight text-dark group-hover:text-gold transition-colors duration-300 leading-none",
              textClassName
            )}
          >
            Accbot
          </span>
          <span className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5 leading-none">
            Nexora Client
          </span>
        </div>
      )}
    </Link>
  );
}
