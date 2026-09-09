import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ClipboardCheck,
  BookOpen,
  Calculator,
  Wallet,
  FileText,
  LineChart,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { getActiveServices, getServiceBySlug } from "@/actions/services";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  ClipboardCheck,
  BookOpen,
  Calculator,
  Wallet,
  FileText,
  LineChart,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const services = await getActiveServices();
    return services.map((service) => ({ slug: service.slug }));
  } catch {
    // DB not yet migrated — return empty to allow build to succeed
    return [];
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const service = await getServiceBySlug(resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.icon] || HelpCircle;

  return (
    <div className="flex flex-col w-full">
      {/* Service Banner */}
      <section className="relative bg-card text-foreground dark:bg-dark dark:text-white py-20 overflow-hidden border-b border-border dark:border-gold/10">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-gold font-semibold">{service.title}</span>
          </nav>

          <div className="h-14 w-14 bg-gold/15 border border-gold/30 text-gold rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <Icon className="h-7 w-7" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground dark:text-white tracking-tight mb-4">
            {service.title}
          </h1>
          <div className="gold-divider mb-4" />
          <p className="text-muted-foreground dark:text-silver/90 text-base md:text-lg max-w-2xl font-normal leading-relaxed">
            {service.short_description}
          </p>
        </div>
      </section>

      {/* Overview & Benefits */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Overview Left */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground flex items-center gap-3">
                Overview
              </h2>
              <div className="gold-divider" />
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {service.overview}
              </p>
            </div>

            {/* Benefits Right */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
                Key Benefits
              </h2>
              <div className="gold-divider" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.benefits.map((benefit, i) => (
                  <Card key={i} className="border border-border/80 rounded-xl p-4 bg-surface/50">
                    <div className="flex gap-3 items-start">
                      <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-foreground leading-relaxed">{benefit}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Process steps */}
      <section className="section-padding bg-surface/40">
        <div className="container-custom">
          <SectionHeader
            tag="Process"
            title="How We Execute This Service"
            description="Our structured steps ensure error-free deliveries and absolute regulatory compliance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.process_steps.map((step) => (
              <Card key={step.step} className="border border-border/80 bg-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                <span className="absolute -top-6 -right-6 text-7xl font-bold text-gold/5 font-heading">
                  {step.step}
                </span>
                <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-lg flex items-center justify-center font-bold text-sm">
                  0{step.step}
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl">
          <SectionHeader
            tag="FAQ"
            title="Frequently Asked Questions"
            description="Got questions about this service? Here are answers to our most common client inquiries."
          />

          <Accordion className="w-full">
            {service.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 py-2">
                <AccordionTrigger className="font-heading font-semibold text-sm sm:text-base text-foreground hover:text-gold hover:no-underline transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs sm:text-sm leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      </section>

      {/* Service Contact CTA */}
      <section className="section-padding bg-gradient-to-b from-card to-surface text-foreground dark:from-dark dark:to-[#0A0B0E] dark:text-white border-t border-border dark:border-gold/10">
        <div className="container-custom text-center max-w-3xl flex flex-col items-center">
          <h2 className="text-3xl font-bold font-heading text-foreground dark:text-white mb-4">
            Request an Inquiry for {service.title}
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-muted-foreground dark:text-silver/90 text-base font-normal mb-8 leading-relaxed max-w-xl">
            Get an instant custom quote and consult our chartered accounting team. Secure your corporate audit or tax registration details.
          </p>
          <Link href="/contact">
            <Button size="lg" className="flex items-center gap-2 group shadow-lg">
              <span>Contact Advisor</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
