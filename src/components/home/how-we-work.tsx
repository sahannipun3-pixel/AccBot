"use client";

import { motion } from "framer-motion";
import { MessageSquare, BarChart3, Cog, HeartHandshake, HelpCircle } from "lucide-react";
import { PROCESS_STEPS } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { staggerContainer, slideUp } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  BarChart3,
  Cog,
  HeartHandshake,
};

export function HowWeWork() {
  return (
    <section className="section-padding bg-surface relative overflow-hidden">
      {/* Background vectors */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeader
          tag="Onboarding"
          title="Our Structured Workflow Methodology"
          description="We make working with us smooth, organized, and transparent. Here is how we build your custom solution, step-by-step."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Connector Line (Desktop only) */}
          <div className="absolute top-12 left-0 w-full h-0.5 bg-border/80 hidden lg:block z-0" />

          {PROCESS_STEPS.map((step) => {
            const Icon = iconMap[step.icon] || HelpCircle;
            return (
              <motion.div
                key={step.step}
                variants={slideUp}
                className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4"
              >
                {/* Step circle */}
                <div className="relative flex items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-card border border-border group hover:border-gold/50 hover:shadow-lg transition-all duration-300 flex items-center justify-center z-10">
                    <Icon className="h-7 w-7 text-foreground/80 group-hover:text-gold transition-colors duration-300" />
                  </div>
                  {/* Step index badge */}
                  <span className="absolute -top-3 -right-3 h-8 w-8 bg-gradient-to-r from-gold to-gold-light text-dark font-bold text-xs rounded-full flex items-center justify-center border-4 border-surface shadow-sm">
                    {step.step}
                  </span>
                </div>

                <div className="space-y-2 max-w-xs">
                  <h3 className="font-heading font-bold text-base text-foreground pt-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
