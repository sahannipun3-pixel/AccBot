"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock, AlertCircle, Loader2, ShieldCheck, Info } from "lucide-react";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";
import { changePassword } from "@/actions/users";
import { signOutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { User } from "@/types";

interface Props {
  user: User;
}

export default function SecurityClient({ user }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const result = await changePassword(data);
      if (result.success) {
        toast.success("Password changed successfully. Please sign in again.");
        reset();
        // Sign out after password change for security
        setTimeout(() => signOutUser(), 1500);
      } else {
        toast.error(result.error ?? "Failed to change password.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    }
  };

  const lastUpdated = new Date(user.updated_at).toLocaleDateString("en-AE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">Security</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your password and account security settings.
        </p>
      </div>

      {/* Security Status Card */}
      <div className="bg-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2 mb-5">
          <ShieldCheck className="h-4 w-4 text-gold" />
          <span>Security Overview</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface/60 border border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Account Email
            </p>
            <p className="text-sm font-mono font-semibold text-foreground truncate">{user.email}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Used for login & communications</p>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Last Account Update
            </p>
            <p className="text-sm font-semibold text-foreground">{lastUpdated}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Profile or password changed</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 sm:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Your account is {user.is_active ? "active and secure" : "inactive"}.
              </p>
            </div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              All sessions are protected with JWT authentication. Passwords are bcrypt-hashed.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-card rounded-2xl border border-border/70 p-6 sm:p-8">
        <div className="pb-5 border-b border-border/50 mb-6">
          <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gold" />
            <span>Change Password</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Use a strong, unique password to keep your account secure.
          </p>
        </div>

        {/* Security tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gold/10 border border-gold/20 mb-5">
          <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-gold-700 dark:text-gold-light">
            After changing your password, you&apos;ll be automatically signed out for security. Please sign in again with your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-xs font-semibold text-foreground">
              Current Password <span className="text-error">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-password"
                type="password"
                {...register("currentPassword")}
                placeholder="••••••••"
                className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                autoComplete="current-password"
              />
            </div>
            {errors.currentPassword && (
              <p className="text-error text-xs flex items-center gap-1 mt-1" role="alert">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.currentPassword.message}</span>
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
                New Password <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  {...register("newPassword")}
                  placeholder="At least 6 characters"
                  className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                  autoComplete="new-password"
                />
              </div>
              {errors.newPassword && (
                <p className="text-error text-xs flex items-center gap-1 mt-1" role="alert">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.newPassword.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                Confirm Password <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Repeat new password"
                  className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-error text-xs flex items-center gap-1 mt-1" role="alert">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.confirmPassword.message}</span>
                </p>
              )}
            </div>
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
