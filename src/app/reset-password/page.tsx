"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Key, AlertCircle, ArrowLeft } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validators";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const token = searchParams.get("token") || "";
      const res = await resetPassword({ ...data, token });
      if (res.success) {
        toast.success("Your password has been reset successfully. Please log in.");
        router.push("/login");
      } else {
        toast.error(res.error || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      <Card className="w-full max-w-md border border-border/80 bg-card rounded-2xl shadow-lg relative z-10">
        <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light rounded-t-2xl" />
        <CardHeader className="pt-8 px-8 pb-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
            Enter a new password for your Accbot portal account.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">New Password</Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                />
              </div>
              {errors.password && (
                <p className="text-error text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">Confirm New Password</Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-error text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.confirmPassword.message}</span>
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
                  <span>Saving new password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Save Password</span>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
