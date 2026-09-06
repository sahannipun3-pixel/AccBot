"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { staggerContainer, slideUp } from "@/lib/utils";
import type { Testimonial } from "@/types";

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsClient({ testimonials }: Props) {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeader
          tag="Testimonials"
          title="What Our Clients Say About Us"
          description="We take pride in our service. Read how we help companies secure compliance, optimize budgets, and grow."
        />

        {testimonials.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.id || testimonial.name} variants={slideUp}>
                <Card className="h-full border-border hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 card-hover bg-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                  {/* Quotation mark icon watermark */}
                  <Quote className="absolute top-4 right-4 h-12 w-12 text-gold/5 shrink-0" />
                  
                  <CardContent className="p-0 space-y-6">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? "fill-gold text-gold" : "text-border"
                          }`} 
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-foreground text-sm leading-relaxed italic relative z-10">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    {/* Profile info */}
                    <div className="flex items-center gap-3.5 pt-4 border-t border-border/50">
                      <Avatar className="h-10 w-10 border border-gold/20">
                        {testimonial.avatar_url && (
                          <AvatarImage src={testimonial.avatar_url} alt={testimonial.name} />
                        )}
                        <AvatarFallback className="bg-gold-50 text-gold font-bold text-sm">
                          {testimonial.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <h4 className="font-heading font-bold text-sm text-foreground">
                          {testimonial.name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No testimonials found. Please check database configuration.
          </p>
        )}
      </div>
    </section>
  );
}
