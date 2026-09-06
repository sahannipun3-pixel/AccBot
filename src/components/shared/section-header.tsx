"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { slideUp } from "@/lib/utils";

interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeader({
  tag,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end",
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={slideUp}
      className={cn("flex flex-col max-w-3xl mb-12 md:mb-16", alignmentClasses[align], className)}
    >
      {tag && (
        <span className="text-xs font-bold text-gold tracking-widest uppercase mb-3 bg-gold-50 px-3 py-1.5 rounded-full border border-gold/10">
          {tag}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground leading-tight tracking-tight mb-4">
        {title}
      </h2>
      <div className="gold-divider mb-5" />
      {description && (
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </motion.div>
  );
}
