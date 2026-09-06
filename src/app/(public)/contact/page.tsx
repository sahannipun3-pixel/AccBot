"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquareCode, AlertCircle } from "lucide-react";
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
        toast.success("Thank you! Your message has been sent successfully. One of our agents will contact you shortly.");
        reset();
      } else {
        toast.error(typeof res.error === "string" ? res.error : "Failed to submit. Please check your inputs.");
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
      <section className="relative bg-card text-foreground dark:bg-dark dark:text-white py-20 overflow-hidden border-b border-border dark:border-gold/10">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-4">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground dark:text-white">Contact Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground dark:text-white mb-4">
            Connect With Our Experts
          </h1>
          <div className="gold-divider mb-4" />
          <p className="text-muted-foreground dark:text-silver/90 text-base md:text-lg max-w-xl font-normal">
            We are here to answer your accounting, business incorporation, RAMIS tax filing, and auditing questions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-background relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left Contact Info Column */}
            <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-heading text-foreground">
                  Contact Information
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Have questions about our audits, IRD tax representation, or corporate setup? Reach out directly or fill out the form.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-foreground">Office Location</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed mt-1">{COMPANY.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-foreground">Email Support</h4>
                      <a href={`mailto:${COMPANY.email}`} className="text-muted-foreground hover:text-gold text-xs transition-colors mt-1 block">
                        {COMPANY.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-gold/15 border border-gold/25 text-gold rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-foreground">Direct Phone</h4>
                      <a href={`tel:${COMPANY.phone}`} className="text-muted-foreground hover:text-gold text-xs transition-colors mt-1 block">
                        {COMPANY.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp & Map placeholders */}
              <div className="space-y-6 pt-6 border-t border-border">
                {/* Float WhatsApp */}
                <a
                  href={`https://wa.me/${COMPANY.whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold py-4 rounded-xl shadow-md transition-colors"
                >
                  <MessageSquareCode className="h-5 w-5" />
                  <span>Chat on WhatsApp</span>
                </a>

                {/* Simulated Google Map */}
                <div className="relative w-full h-48 bg-surface/50 border border-border rounded-2xl overflow-hidden shadow-sm flex items-center justify-center text-center">
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="p-6">
                    <MapPin className="h-8 w-8 text-gold mx-auto mb-2 animate-bounce" />
                    <h5 className="font-heading font-bold text-xs text-foreground">Colombo Business District (WTC) Map</h5>
                    <p className="text-muted-foreground text-[10px] mt-1 max-w-xs mx-auto">
                      World Trade Center, Echelon Square, Colombo 01, Sri Lanka.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <Card className="border border-border/80 bg-card rounded-2xl shadow-sm p-6 sm:p-8">
                <h3 className="font-heading font-bold text-xl text-foreground mb-6">
                  Send a Message
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="name" className="text-xs font-semibold text-foreground">Your Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register("name")}
                        className="bg-surface/50 border-border/80 rounded-xl"
                      />
                      {errors.name && (
                        <p className="text-error text-xs flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="email" className="text-xs font-semibold text-foreground">Your Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...register("email")}
                        className="bg-surface/50 border-border/80 rounded-xl"
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
                    <div className="space-y-2 text-left">
                      <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        placeholder="+94 7X XXX XXXX"
                        {...register("phone")}
                        className="bg-surface/50 border-border/80 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="subject" className="text-xs font-semibold text-foreground">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Corporate Tax & Bookkeeping Inquiry"
                        {...register("subject")}
                        className="bg-surface/50 border-border/80 rounded-xl"
                      />
                      {errors.subject && (
                        <p className="text-error text-xs flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.subject.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <Label htmlFor="message" className="text-xs font-semibold text-foreground">Message *</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us details about your corporate setup, transaction frequency, or audit needs..."
                      {...register("message")}
                      className="bg-surface/50 border-border/80 rounded-xl resize-none"
                    />
                    {errors.message && (
                      <p className="text-error text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.message.message}</span>
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
