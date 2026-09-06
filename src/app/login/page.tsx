"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Key, Mail, AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { signInWithEmail, signInWithGoogle } from "@/actions/auth";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.43-2.502 4.14-5.174 4.14-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.552 0 2.969.577 4.053 1.52l3.103-3.103C19.23 2.685 15.93 1.25 12.24 1.25c-5.94 0-10.75 4.81-10.75 10.75s4.81 10.75 10.75 10.75c5.68 0 10.66-4.08 10.66-10.75 0-.7-.06-1.38-.17-2.025H12.24z" />
  </svg>
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextTarget = searchParams.get("next") || "/portal/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await signInWithEmail(data);
      if (res.success) {
        toast.success("Successfully logged in!");
        const destination =
          searchParams.get("next") ||
          (res.role === "admin" || res.role === "super_admin" ? "/admin" : "/portal/dashboard");
        router.push(destination);
        // Do NOT call router.refresh() here — the push() navigation already
        // fetches fresh server component data (including the new JWT cookies).
        // Calling refresh() simultaneously causes a double-render that makes
        // the page appear stuck loading, especially on server-heavy pages like /admin.
      } else {
        toast.error(res.error || "Invalid email or password.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <Card className="w-full max-w-md border border-border/80 bg-card rounded-2xl shadow-lg relative z-10">
        <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light rounded-t-2xl" />
        <CardHeader className="pt-8 px-8 pb-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
            Log in to manage your profile, trackers, and books.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-gold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
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

            <div className="flex items-center space-x-2 text-left py-1">
              <Checkbox
                id="rememberMe"
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full flex items-center justify-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-dark border-t-transparent" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Log In</span>
                </>
              )}
            </Button>

            <div className="relative my-6 flex items-center justify-center">
              <span className="absolute inset-x-0 h-[1px] bg-border/60" />
              <span className="relative bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                or authenticate via
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2.5 border-border hover:bg-surface/30 cursor-pointer shadow-sm transition-all"
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch {
                  toast.error("Failed to redirect to Google OAuth.");
                }
              }}
            >
              <GoogleIcon className="h-4 w-4 text-foreground shrink-0" />
              <span className="font-semibold text-xs text-foreground">Continue with Google</span>
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gold font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
