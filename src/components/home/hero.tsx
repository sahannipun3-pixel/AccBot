"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ShieldCheck, Award, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slideUp } from "@/lib/utils";
import { getCurrentUser } from "@/actions/auth";

export function Hero() {
  const [destination, setDestination] = useState("/signup");
  const [ctaText, setCtaText] = useState("Get Started");

  useEffect(() => {
    async function resolveCta() {
      try {
        const user = await getCurrentUser();
        if (user) {
          if (user.role === "admin" || user.role === "super_admin") {
            setDestination("/admin");
            setCtaText("Go to Admin Console");
          } else {
            setDestination("/portal/dashboard");
            setCtaText("Go to Client Portal");
          }
        } else {
          setDestination("/signup");
          setCtaText("Get Started");
        }
      } catch {
        setDestination("/signup");
        setCtaText("Get Started");
      }
    }
    resolveCta();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background text-foreground dark:bg-dark dark:text-white py-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      
      {/* Decorative gradient glow orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-gold/15 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Subtle lines or geometric shapes */}
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3.5 py-1.5 rounded-full mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-bold text-gold tracking-widest uppercase">
              Premier Financial Services • Sri Lanka
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading text-foreground dark:text-white leading-tight tracking-tight mb-6"
          >
            Elite Financial Architecture <br />
            <span className="text-gradient-gold">For Modern Enterprises.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } }
            }}
            className="text-muted-foreground dark:text-silver/95 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-normal"
          >
            We provide premium accounting, bookkeeping, taxation, and corporate advisory services across Sri Lanka. Securing IRD compliance, optimizing profitability, and enabling strategic growth.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } }
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <Link href={destination} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group flex items-center justify-center gap-2 font-bold shadow-md shadow-gold/10">
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto group flex items-center justify-center gap-2 font-semibold">
                <span>Explore Services</span>
              </Button>
            </Link>
          </motion.div>

          {/* Quick trust metrics */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 0.5, duration: 0.8 } }
            }}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-8 border-t border-border dark:border-silver/10 w-full"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground dark:text-silver/90 font-medium">CA Sri Lanka & IRD Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground dark:text-silver/90 font-medium">Partner-Level Advisory</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground dark:text-silver/90 font-medium">Verified Client Portal</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Right Visual Column — Authentic Corporate Advisory & Regulatory Trust */}
        <div className="lg:col-span-5 hidden lg:block relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* Main Advisor Showcase Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-border dark:border-gold/30 shadow-2xl bg-card">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/hero-advisory.jpg"
                  alt="AccBot Senior Chartered Accountant reviewing audited financial statements with client in Colombo corporate boardroom"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Top Floating Badge: Regulatory Authority */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-background/90 dark:bg-dark/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gold/30 shadow-md">
                    <ShieldCheck className="h-4 w-4 text-gold" />
                    <span className="text-[11px] font-bold text-foreground tracking-wide uppercase">
                      CA Sri Lanka & IRD Compliant
                    </span>
                  </div>
                  <div className="bg-gold text-dark font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                    Licensed
                  </div>
                </div>

                {/* Bottom Image Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-silver/90 tracking-wide">Chartered Advisory Practice</span>
                  </div>
                  <p className="text-sm font-bold leading-snug">
                    Partner-Led Tax Strategy, Corporate Audits & Advisory
                  </p>
                </div>
              </div>

              {/* Bottom Credential Grid */}
              <div className="p-4 bg-card/95 backdrop-blur-md grid grid-cols-3 gap-2.5 border-t border-border/80">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-muted/40 border border-border/40">
                  <Award className="h-4 w-4 text-gold mb-1" />
                  <span className="text-xs font-bold text-foreground">100%</span>
                  <span className="text-[10px] text-muted-foreground">IRD Compliance</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-muted/40 border border-border/40">
                  <Briefcase className="h-4 w-4 text-gold mb-1" />
                  <span className="text-xs font-bold text-foreground">15+ Yrs</span>
                  <span className="text-[10px] text-muted-foreground">Senior Advisory</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-muted/40 border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-gold mb-1" />
                  <span className="text-xs font-bold text-foreground">LKR 4B+</span>
                  <span className="text-[10px] text-muted-foreground">Audited Assets</span>
                </div>
              </div>
            </div>

            {/* Subtle Decorative Floating Badge */}
            <div className="absolute -bottom-4 -left-4 bg-card/95 backdrop-blur-md text-foreground px-4 py-2.5 rounded-2xl border border-border dark:border-gold/30 shadow-xl flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Client Satisfaction</p>
                <h4 className="text-xs font-bold text-foreground">Verified Partnership</h4>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
