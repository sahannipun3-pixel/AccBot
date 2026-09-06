"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slideUp } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-dark text-white py-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      
      {/* Decorative gradient glow orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-gold/15 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Subtle lines or geometric shapes */}
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-silver/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-silver/10 to-transparent pointer-events-none" />

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
              Premier Financial Services
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading text-white leading-tight tracking-tight mb-6"
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
            className="text-silver/95 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-2xl font-light"
          >
            We provide premium accounting, bookkeeping, taxation, and business advisory services across the UAE. Securing compliance, optimizing profitability, and enabling strategic growth.
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
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group flex items-center justify-center gap-2">
                <span>Book Free Consultation</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto group flex items-center justify-center gap-2">
                <Play className="h-4 w-4 fill-current text-gold" />
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
            className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-8 border-t border-silver/10 w-full"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gold" />
              <span className="text-xs text-silver/90">FTA Compliant Tax Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gold" />
              <span className="text-xs text-silver/90">Premium Client Relations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gold" />
              <span className="text-xs text-silver/90">Zero Upfront Commitments</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Right Visual Column */}
        <div className="lg:col-span-5 hidden lg:block relative">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-square max-w-md mx-auto"
          >
            {/* Elegant luxury visual elements representing balance, charts, structure */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/15 via-transparent to-silver/5 rounded-3xl border border-gold/30 shadow-2xl overflow-hidden glass-dark">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gold tracking-widest uppercase">Enterprise Health</span>
                    <h3 className="text-xl font-bold font-heading text-white">Financial Security</h3>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <span className="text-xs text-gold font-bold">A+</span>
                  </div>
                </div>

                {/* Simulated Chart/Visual */}
                <div className="space-y-4 my-8">
                  <div className="h-2 w-full bg-silver/10 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: "85%" }} 
                       transition={{ duration: 1.5, delay: 0.6 }} 
                       className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" 
                    />
                  </div>
                  <div className="h-2 w-full bg-silver/10 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: "95%" }} 
                       transition={{ duration: 1.5, delay: 0.8 }} 
                       className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" 
                    />
                  </div>
                  <div className="h-2 w-full bg-silver/10 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: "70%" }} 
                       transition={{ duration: 1.5, delay: 1.0 }} 
                       className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-silver/80 pt-4 border-t border-silver/10">
                  <span>Accbot Ledger Analysis</span>
                  <span className="text-gold font-semibold">Active Monitoring</span>
                </div>
              </div>
            </div>
            {/* Overlay badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-card text-foreground p-4 rounded-xl border border-border shadow-xl flex items-center gap-3"
            >
              <div className="h-10 w-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Audit Approval Rate</p>
                <h4 className="text-sm font-bold">100% Guaranteed</h4>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
