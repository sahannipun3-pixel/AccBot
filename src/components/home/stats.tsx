"use client";

import { motion } from "framer-motion";
import { STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { staggerContainer, slideUp } from "@/lib/utils";

export function Stats() {
  return (
    <section className="bg-card text-foreground dark:bg-dark dark:text-white border-y border-border dark:border-gold/10 relative overflow-hidden py-12 md:py-16">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
      <div className="container-custom relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={slideUp}
              className="flex flex-col items-center text-center space-y-2 px-4 border-border/70 border-r odd:border-r even:border-none md:border-r md:last:border-none"
            >
              <div className="flex items-baseline justify-center">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-gold tracking-tight"
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold tracking-wide uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
