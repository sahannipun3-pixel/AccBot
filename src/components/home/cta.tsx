"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slideUp } from "@/lib/utils";

export function CallToAction() {
  return (
    <section className="section-padding bg-dark text-white relative overflow-hidden border-t border-gold/20">
      {/* Background visual components */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="container-custom relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={slideUp}
          className="space-y-6 flex flex-col items-center"
        >
          <span className="text-xs font-bold text-gold tracking-widest uppercase bg-gold/15 border border-gold/30 px-3.5 py-1.5 rounded-full">
            Start Partnering Today
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white leading-tight tracking-tight max-w-3xl">
            Ready to Streamline Your Company&apos;s Financial Strategy?
          </h2>
          <div className="gold-divider mx-auto" />
          <p className="text-silver/90 text-base md:text-lg leading-relaxed max-w-2xl font-light">
            Contact our accredited corporate consultants today. Discover how we can help you register a business, handle books, and optimize corporate tax liabilities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group flex items-center justify-center gap-2">
                <span>Book Consultation</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <span>Learn More</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
