"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { KeyRound, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators";
import { sendPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const res = await sendPasswordReset(data);
      if (res.success) {
        toast.success("Password reset email sent!");
        setEmailSent(true);
      } else {
        toast.error(res.error || "Failed to trigger password reset. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <Card className="w-full max-w-md border border-border/80 bg-card rounded-2xl shadow-lg relative z-10 text-center p-8">
          <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light rounded-t-2xl absolute top-0 left-0 w-full" />
          <KeyRound className="h-12 w-12 text-gold mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold font-heading text-foreground mb-3">Reset Email Sent</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            We have sent password reset instructions to your email. Check your spam folder if you do not receive it shortly.
          </p>
          <Link href="/login" className="w-full">
            <Button className="w-full bg-gradient-to-r from-gold to-gold-light text-dark font-bold py-4 rounded-xl">
              Back to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      <Card className="w-full max-w-md border border-border/80 bg-card rounded-2xl shadow-lg relative z-10">
        <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light rounded-t-2xl" />
        <CardHeader className="pt-8 px-8 pb-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Forgot Password
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
            Enter your email below and we will send password reset links.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-dark font-bold py-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send Reset Email</span>
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/login" className="text-gold font-bold hover:underline flex items-center justify-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
