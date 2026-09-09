"use client";

import { motion } from "framer-motion";
import { Check, Shield, TrendingUp, Cpu } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { hoverLift } from "@/lib/utils";

const points = [
  {
    icon: Shield,
    title: "Uncompromising Compliance",
    description: "We navigate complex local and international tax and audit laws, ensuring your business is fully compliant.",
  },
  {
    icon: TrendingUp,
    title: "Financial Advisory",
    description: "Receive strategic advisory to optimize operations, improve cash flows, and scale your organization.",
  },
  {
    icon: Cpu,
    title: "State-of-the-Art Tools",
    description: "We utilize next-generation accounting software to deliver secure, automated, and error-free books.",
  },
];

export function Intro() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <SectionHeader
              tag="Who We Are"
              title="Dedicated Financial Partners Committed to Your Growth"
              description="Accbot is a leading accounting and advisory firm. Designed for corporate clients and growing enterprises seeking premium, high-integrity financial support, we handle everything from basic bookkeeping to complex tax planning and audits."
              align="left"
              className="mb-6"
            />
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gold/10 dark:bg-gold/15 border border-gold/30 text-gold rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-foreground text-sm font-medium">Fully certified auditing agents.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gold/10 dark:bg-gold/15 border border-gold/30 text-gold rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-foreground text-sm font-medium">Personalized 1-on-1 financial consultation.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gold/10 dark:bg-gold/15 border border-gold/30 text-gold rounded-full flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-foreground text-sm font-medium">Strategic guidance on international setup.</span>
              </li>
            </ul>
          </div>

          {/* Right Cards Column */}
          <div className="lg:col-span-6 space-y-6">
            {points.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" }
                    }
                  }}
                  whileHover="hover"
                  variants-hover={hoverLift.hover}
                  className="flex gap-5 p-6 bg-surface/40 border border-border/50 rounded-2xl transition-all duration-300 hover:border-gold/30 hover:bg-card hover:shadow-lg hover:shadow-gold/5 group"
                >
                  <div className="h-12 w-12 bg-card border border-border group-hover:border-gold/20 group-hover:text-gold rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <Icon className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-heading font-bold text-base text-foreground group-hover:text-gold transition-colors">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
