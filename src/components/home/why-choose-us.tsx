"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, Lock, Settings, TrendingUp, Award, HelpCircle } from "lucide-react";
import { WHY_CHOOSE_US } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";
import { staggerContainer, slideUp } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Clock,
  Lock,
  Settings,
  TrendingUp,
  Award,
};

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeader
          tag="Our Competence"
          title="Why Leading Enterprises Choose Accbot"
          description="We do more than just prepare reports; we form true corporate strategic partnerships that build trust and drive long-term business performance."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {WHY_CHOOSE_US.map((item) => {
            const Icon = iconMap[item.icon] || HelpCircle;
            return (
              <motion.div key={item.title} variants={slideUp}>
                <Card className="h-full border-border hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 card-hover bg-card/60 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="h-10 w-10 bg-gold/15 border border-gold/10 text-gold rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading font-bold text-base text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
