"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  BookOpen,
  Calculator,
  Wallet,
  FileText,
  LineChart,
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerContainer, slideUp } from "@/lib/utils";
import type { Service } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  ClipboardCheck,
  BookOpen,
  Calculator,
  Wallet,
  FileText,
  LineChart,
};

interface Props {
  services: Service[];
}

export function ServicesGrid({ services }: Props) {
  return (
    <section className="section-padding bg-surface relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeader
          tag="Our Offerings"
          title="Customized Financial &amp; Accounting Services"
          description="We support your business throughout its entire lifecycle with compliance, audit readiness, taxation strategies, and bookkeeping solutions."
        />

        {services.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service) => {
              const Icon = iconMap[service.icon] || FileText;
              return (
                <motion.div key={service.slug} variants={slideUp} className="h-full">
                  <Card className="h-full flex flex-col justify-between border-border hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 card-hover group overflow-hidden bg-card rounded-2xl">
                    <div className="p-1 h-1.5 bg-gradient-to-r from-gold/50 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="pt-6 px-6 pb-4">
                      <div className="h-12 w-12 bg-gold/15 border border-gold/10 text-gold rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-gold transition-colors duration-300">
                        {service.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.short_description}
                      </p>
                    </CardContent>
                    <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-between items-center mt-auto">
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-xs font-semibold text-foreground group-hover:text-gold flex items-center gap-1.5 transition-colors group/link"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No services found. Please run the seed SQL.
          </p>
        )}

        <div className="flex justify-center mt-12">
          <Link href="/services">
            <Button variant="outline" size="lg" className="px-8 font-semibold">
              Explore All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
