"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Scale, Target, Lightbulb, Users, Eye, HelpCircle } from "lucide-react";
import { CORE_VALUES } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staggerContainer, slideUp } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  Target,
  Lightbulb,
  Users,
  Eye,
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Page Banner / Hero */}
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
            <span className="text-foreground dark:text-white">About Us</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold font-heading text-foreground dark:text-white mb-4"
          >
            About Accbot
          </motion.h1>
          <div className="gold-divider mb-4" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground dark:text-silver/90 text-base md:text-lg max-w-xl font-normal"
          >
            Empowering Sri Lankan businesses with modern financial solutions, reliable bookkeeping, and certified tax advisory.
          </motion.p>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-background relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Story Text */}
            <div className="lg:col-span-6 space-y-6">
              <SectionHeader
                tag="Our History"
                title="The Accbot Journey"
                align="left"
                className="mb-4"
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                Founded with a mission to simplify corporate financial structures, Accbot has grown into a trusted partner for companies scaling in Sri Lanka and regionally. Developed as a bespoke client portal by Nexora Software Solutions, we fuse years of certified bookkeeping, payroll expertise, and audit compliance into a unified digital experience.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We believe accounting should not be a chore or a mystery. By providing transparent, real-time insights, we empower executives to make informed growth decisions. Whether you are a newly incorporated private limited company or an established enterprise preparing for annual tax returns, our certified professionals support you at every tier of your journey.
              </p>
            </div>

            {/* Visual Column / Mission-Vision */}
            <div className="lg:col-span-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="border border-border/80 bg-surface/50 rounded-2xl p-6 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
                  <h3 className="font-heading font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gold" /> Our Mission
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    To deliver accurate, transparent, and IRD-compliant financial services that enable businesses to operate smoothly, minimize compliance risks, and achieve financial security.
                  </p>
                </Card>
                <Card className="border border-border/80 bg-surface/50 rounded-2xl p-6 hover:border-gold/30 hover:shadow-lg transition-all duration-300">
                  <h3 className="font-heading font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gold" /> Our Vision
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    To build a modern, technology-driven accounting and auditing firm recognized regionally for high-integrity advisory, absolute precision, and client satisfaction.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-surface/40 relative overflow-hidden">
        <div className="container-custom">
          <SectionHeader
            tag="Our Culture"
            title="Core Corporate Values"
            description="The operational values that define our relationships, audit processes, and client advisory services."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          >
            {CORE_VALUES.map((value) => {
              const Icon = iconMap[value.icon] || HelpCircle;
              return (
                <motion.div key={value.title} variants={slideUp}>
                  <Card className="h-full border-border hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 card-hover bg-card rounded-2xl p-5 flex flex-col gap-4 text-center items-center">
                    <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-heading font-semibold text-sm text-foreground">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Corporate Experience / Accreditations */}
      <section className="section-padding bg-background">
        <div className="container-custom text-center max-w-4xl">
          <SectionHeader
            tag="Our Qualifications"
            title="Professional Experience & Certifications"
            description="Our team holds registrations and accreditations that certify our work meets CA Sri Lanka and IRD standards."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
            <div className="p-6 border border-border/80 rounded-2xl bg-surface/50 text-center space-y-1">
              <h4 className="text-xl font-bold text-foreground font-heading">CA Sri Lanka</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Chartered Accountants</p>
            </div>
            <div className="p-6 border border-border/80 rounded-2xl bg-surface/50 text-center space-y-1">
              <h4 className="text-xl font-bold text-foreground font-heading">ISO 9001</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Quality Audited</p>
            </div>
            <div className="p-6 border border-border/80 rounded-2xl bg-surface/50 text-center space-y-1">
              <h4 className="text-xl font-bold text-foreground font-heading">100%</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Regulatory Compliance</p>
            </div>
            <div className="p-6 border border-border/80 rounded-2xl bg-surface/50 text-center space-y-1">
              <h4 className="text-xl font-bold text-foreground font-heading">LKR 25B+</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Managed Accounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-b from-card to-surface text-foreground dark:from-dark dark:to-[#0A0B0E] dark:text-white relative border-t border-border dark:border-gold/10">
        <div className="container-custom text-center max-w-3xl flex flex-col items-center">
          <h2 className="text-3xl font-bold font-heading text-foreground dark:text-white mb-4">
            Partner with Certified Accounting Advisors
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-muted-foreground dark:text-silver/90 text-base font-normal mb-8 leading-relaxed max-w-xl">
            Book a private advisory session to review company incorporation, corporate tax filing, or bookkeeping workflows.
          </p>
          <Link href="/contact">
            <Button size="lg" className="flex items-center gap-2 group shadow-lg">
              <span>Contact Us Today</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
