"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquareCode,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/lib/validators";
import { COMPANY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { submitContactForm } from "@/actions/contact";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const res = await submitContactForm(data);
      if (res.success) {
        toast.success(
          "Thank you! Your inquiry has been received. A senior advisor will review your details and respond within 2 business hours."
        );
        reset();
      } else {
        toast.error(
          typeof res.error === "string"
            ? res.error
            : "Failed to submit. Please check your form entries."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Banner */}
      <section className="relative bg-card text-foreground dark:bg-dark dark:text-white py-16 sm:py-20 overflow-hidden border-b border-border dark:border-gold/10">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-gold font-semibold">Contact Us</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-foreground dark:text-white tracking-tight mb-4">
            Connect With Our Corporate Advisory Practice
          </h1>
          <div className="gold-divider mb-4" />
          <p className="text-muted-foreground dark:text-silver/90 text-base md:text-lg max-w-2xl font-normal leading-relaxed">
            Consult our accredited chartered accountants regarding corporate tax planning, statutory audits, IRD RAMIS compliance, or bookkeeping partnerships.
          </p>
        </div>
      </section>

      {/* Top 4-Card Contact Grid */}
      <section className="py-12 bg-surface/50 border-b border-border">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Headquarters */}
            <Card className="p-5 bg-card border-border/80 hover:border-gold/30 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Colombo Headquarters</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                    Level 12, West Tower, WTC, Echelon Square, Colombo 01
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-gold font-semibold flex items-center gap-1">
                <span>Central Business District</span>
              </div>
            </Card>

            {/* Direct Line */}
            <Card className="p-5 bg-card border-border/80 hover:border-gold/30 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Direct Advisory Line</h3>
                  <a
                    href={`tel:${COMPANY.phone}`}
                    className="text-foreground hover:text-gold text-xs font-semibold leading-relaxed mt-1 block transition-colors"
                  >
                    {COMPANY.phone}
                  </a>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-gold" />
                <span>Mon–Fri: 8:30 AM – 5:30 PM</span>
              </div>
            </Card>

            {/* Email Support */}
            <Card className="p-5 bg-card border-border/80 hover:border-gold/30 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Email Communications</h3>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="text-foreground hover:text-gold text-xs font-semibold leading-relaxed mt-1 block transition-colors truncate"
                  >
                    {COMPANY.email}
                  </a>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>SLA: Response within 2 hrs</span>
              </div>
            </Card>

            {/* WhatsApp Priority Desk */}
            <Card className="p-5 bg-card border-border/80 hover:border-gold/30 hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-xl flex items-center justify-center">
                  <MessageSquareCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Corporate WhatsApp</h3>
                  <a
                    href={`https://wa.me/${COMPANY.whatsapp.replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-[#25D366] text-xs font-semibold leading-relaxed mt-1 block transition-colors"
                  >
                    {COMPANY.whatsapp}
                  </a>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span>Quick Diagnostic Chat</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Advisory Info & Form Section */}
      <section className="section-padding bg-background relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Context, SLA & Office Map */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[11px] font-bold text-gold tracking-wide uppercase">
                    Chartered Advisory Practice
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                  High-Integrity Financial Partnership
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Whether you require an exploratory discussion regarding corporate registration, annual tax audits, or outsourcing your month-end accounts, our senior team is ready to assist.
                </p>
              </div>

              {/* Advisory Commitments */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border/70">
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground font-semibold block">Confidentiality Assured</strong>
                    <span className="text-muted-foreground">All preliminary discussions and financial disclosures are protected under strict NDA standards.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border/70">
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground font-semibold block">Direct Senior Partner Attention</strong>
                    <span className="text-muted-foreground">Consultations are evaluated by qualified Sri Lankan chartered accountants with active IRD registration.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border/70">
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-foreground font-semibold block">Transparent Scoping</strong>
                    <span className="text-muted-foreground">Zero hidden commitments. You receive a clear scope of work and fixed fee advisory options.</span>
                  </div>
                </div>
              </div>

              {/* Clean Colombo Office Card (No bouncy pins) */}
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">Office Location</h4>
                  </div>
                  <a
                    href="https://maps.google.com/?q=World+Trade+Center+Colombo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-gold hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  World Trade Center (West Tower), Echelon Square, Colombo 01. In-person client boardroom meetings available by prior appointment.
                </p>
              </div>

              {/* WhatsApp Quick CTA */}
              <a
                href={`https://wa.me/${COMPANY.whatsapp.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-colors text-sm"
              >
                <MessageSquareCode className="h-4 w-4" />
                <span>Message on WhatsApp Desk</span>
              </a>
            </div>

            {/* Right Column: Executive Inquiry Form */}
            <div className="lg:col-span-7">
              <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="mb-6 space-y-1">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Request Corporate Consultation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Submit your inquiry below and our senior advisory team will prepare a tailored preliminary consultation.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                        Full Name <span className="text-gold">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Sanjeewa Perera"
                        {...register("name")}
                        className="h-10 bg-surface/50 border-border/80 rounded-xl text-sm"
                      />
                      {errors.name && (
                        <p className="text-error text-xs flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                        Corporate Email <span className="text-gold">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. perera@enterprise.lk"
                        {...register("email")}
                        className="h-10 bg-surface/50 border-border/80 rounded-xl text-sm"
                      />
                      {errors.email && (
                        <p className="text-error text-xs flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.email.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone */}
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                        Direct Phone <span className="text-muted-foreground text-[11px] font-normal">(Optional)</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="e.g. +94 77 123 4567"
                        {...register("phone")}
                        className="h-10 bg-surface/50 border-border/80 rounded-xl text-sm"
                      />
                    </div>

                    {/* Service of Interest / Subject */}
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="subject" className="text-xs font-semibold text-foreground">
                        Service of Interest <span className="text-gold">*</span>
                      </Label>
                      <select
                        id="subject"
                        {...register("subject")}
                        className="flex h-10 w-full rounded-xl border border-border/80 bg-surface/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Select corporate service...</option>
                        <option value="Corporate Tax & IRD RAMIS Compliance">Corporate Tax & IRD RAMIS Compliance</option>
                        <option value="Bookkeeping & Monthly Management Accounts">Bookkeeping & Management Accounts</option>
                        <option value="Company Incorporation & Secretarial Services">Company Incorporation & Secretarial</option>
                        <option value="Statutory Audit & Assurance Services">Statutory Audit & Assurance Services</option>
                        <option value="Payroll, EPF & ETF Administration">Payroll, EPF & ETF Administration</option>
                        <option value="General Corporate Financial Advisory">General Corporate Financial Advisory</option>
                      </select>
                      {errors.subject && (
                        <p className="text-error text-xs flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.subject.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="message" className="text-xs font-semibold text-foreground">
                      Inquiry Details <span className="text-gold">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Please share details regarding your enterprise scale, entity type (Pvt Ltd, Sole Proprietor, Partnership), transaction volumes, or specific compliance deadlines..."
                      {...register("message")}
                      className="bg-surface/50 border-border/80 rounded-xl text-sm resize-none"
                    />
                    {errors.message && (
                      <p className="text-error text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.message.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 font-bold shadow-md shadow-gold/10 text-sm h-11"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        <span>Submitting consultation request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Consultation Request</span>
                      </>
                    )}
                  </Button>

                  <p className="text-center text-[11px] text-muted-foreground">
                    By submitting this form, your inquiry is routed to our Colombo corporate advisory team. We respect your confidentiality.
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
