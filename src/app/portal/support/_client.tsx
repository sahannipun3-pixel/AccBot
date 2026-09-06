"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { contactFormSchema, type ContactFormData } from "@/lib/validators";
import { submitContactForm } from "@/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { User } from "@/types";

interface Props {
  user: User;
}

// ─── Contact Info Card ────────────────────────────────────────────────────────

function ContactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function SupportClient({ user }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user.full_name,
      email: user.email,
      phone: user.phone ?? "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        setSubmitted(true);
        toast.success("Message sent! We'll get back to you soon.");
      } else {
        toast.error("Failed to send your message. Please try again.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-1">Support</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
          Help & Support
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Have a question or need assistance? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Panel */}
        <div className="space-y-5">
          <div className="bg-card rounded-2xl border border-border/70 p-6">
            <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2 mb-4">
              <HelpCircle className="h-4 w-4 text-gold" />
              <span>Contact AccBot</span>
            </h2>

            <ContactItem icon={Mail} label="Email" value="info@accbot.com" />
            <ContactItem icon={Phone} label="Phone" value="+94 11 234 5678" />
            <ContactItem icon={MapPin} label="Location" value="Colombo, Sri Lanka" />
            <ContactItem icon={Clock} label="Business Hours" value="Mon–Fri, 9AM–6PM" />
          </div>

          <div className="bg-card rounded-2xl border border-border/70 p-6">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Before You Message
            </h3>
            <div className="space-y-2">
              {[
                "Check your email for our previous replies",
                "Include your account email in the message",
                "Be specific about the service or issue",
                "We reply within 1–2 business days",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border/70 p-6 sm:p-8">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">Message Sent!</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. Our team will review your message and get back to you
                  within 1–2 business days.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-6 rounded-xl"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <>
                <div className="pb-5 border-b border-border/50 mb-6">
                  <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gold" />
                    <span>Send a Message</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill in the form below and our team will respond to you.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="support-name" className="text-xs font-semibold text-foreground">
                        Full Name <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="support-name"
                        {...register("name")}
                        className="bg-surface/50 border-border/80 rounded-xl"
                      />
                      {errors.name && (
                        <p className="text-error text-xs flex items-center gap-1" role="alert">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errors.name.message as string}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="support-email" className="text-xs font-semibold text-foreground">
                        Email Address <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="support-email"
                        type="email"
                        readOnly
                        {...register("email")}
                        className="bg-surface/30 border-border/60 rounded-xl text-muted-foreground font-mono cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="support-phone" className="text-xs font-semibold text-foreground">
                      Phone Number
                      <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                    </Label>
                    <Input
                      id="support-phone"
                      {...register("phone")}
                      placeholder="+94 XX XXX XXXX"
                      className="bg-surface/50 border-border/80 rounded-xl"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <Label htmlFor="support-subject" className="text-xs font-semibold text-foreground">
                      Subject <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="support-subject"
                      {...register("subject")}
                      placeholder="e.g., Question about tax advisory service"
                      className="bg-surface/50 border-border/80 rounded-xl"
                    />
                    {errors.subject && (
                      <p className="text-error text-xs flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.subject.message as string}</span>
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="support-message" className="text-xs font-semibold text-foreground">
                      Message <span className="text-error">*</span>
                    </Label>
                    <textarea
                      id="support-message"
                      {...register("message")}
                      rows={5}
                      placeholder="Describe your question or issue in detail..."
                      className="w-full px-4 py-3 text-sm bg-surface/50 border border-border/80 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-error text-xs flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.message.message as string}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/40 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
