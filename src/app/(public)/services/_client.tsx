"use client";

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
  ArrowRight,
  HelpCircle,
} from "lucide-react";
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

export default function ServicesPageClient({ services }: Props) {
  return (
    <div className="flex flex-col w-full">
      {/* Banner / Hero */}
      <section className="relative bg-card text-foreground dark:bg-dark dark:text-white py-20 overflow-hidden border-b border-border dark:border-gold/10">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-4"
          >
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground dark:text-white">Services</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold font-heading text-foreground dark:text-white mb-4"
          >
            Corporate &amp; Advisory Services
          </motion.h1>
          <div className="gold-divider mb-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground dark:text-silver/90 text-base md:text-lg max-w-xl font-normal"
          >
            Explore our professional services covering company incorporation, IRD tax compliance,
            audit assurance, and financial architecture.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <SectionHeader
            tag="What We Offer"
            title="Core Professional Financial Modules"
            description="Our service suites provide comprehensive solutions designed to address compliance challenges and enhance financial health."
          />

          {services.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Services are being loaded. Please run the seed SQL if this persists.
            </p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service) => {
                const Icon = iconMap[service.icon] || HelpCircle;
                return (
                  <motion.div key={service.slug} variants={slideUp} className="h-full">
                    <Card className="h-full flex flex-col justify-between border-border hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 card-hover bg-card rounded-2xl overflow-hidden group">
                      <div className="p-1 h-1.5 bg-gradient-to-r from-gold/50 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardHeader className="pt-6 px-6 pb-4">
                        <div className="h-12 w-12 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
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
                          className="text-xs font-semibold text-foreground/90 group-hover:text-gold flex items-center gap-1.5 transition-colors group/link"
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
          )}
        </div>
      </section>

      {/* Inquiry Banner */}
      <section className="section-padding bg-background relative">
        <div className="container-custom text-center max-w-3xl flex flex-col items-center">
          <h2 className="text-3xl font-bold font-heading text-foreground mb-4">
            Need a Bespoke Financial Plan?
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xl">
            Our certified accountants and tax advisors can customize solutions based on your size,
            transaction frequency, and business goals.
          </p>
          <Link href="/contact">
            <Button size="lg" className="flex items-center gap-2 group shadow-lg">
              <span>Book Consultation</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
