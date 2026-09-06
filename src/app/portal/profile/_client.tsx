"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User as UserIcon,
  Mail,
  Phone,
  Save,
  Camera,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { profileSchema, type ProfileFormData } from "@/lib/validators";
import { updateProfile } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { User } from "@/types";

interface Props {
  user: User;
}

// ─── Info Row Helper ──────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/40 last:border-0">
      <div className="h-9 w-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

export default function PortalProfileClient({ user: initialUser }: Props) {
  const [user, setUser] = useState(initialUser);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.full_name,
      email: user.email,
      phone: user.phone ?? "",
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");

      setAvatarUrl(data.url);
      await updateProfile(user.id, { avatar_url: data.url });
      setUser((prev) => ({ ...prev, avatar_url: data.url }));
      toast.success("Profile photo updated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const res = await updateProfile(user.id, {
        full_name: data.name,
        phone: data.phone || null,
      });
      if (!res.success) {
        toast.error(res.error || "Failed to update profile.");
        return;
      }
      setUser((prev) => ({
        ...prev,
        full_name: data.name,
        phone: data.phone || null,
      }));
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Client";

  const memberSince = new Date(user.created_at).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Avatar & Account Summary */}
        <div className="space-y-5">
          {/* Avatar Card */}
          <div className="bg-card rounded-2xl border border-border/70 p-6 text-center">
            <div className="relative w-fit mx-auto mb-4">
              <Avatar className="h-24 w-24 border-2 border-gold/30 shadow-lg">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={user.full_name} />}
                <AvatarFallback className="bg-gold/15 text-gold text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gold text-dark flex items-center justify-center shadow-md hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                {avatarUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label="Upload profile photo"
              />
            </div>

            <h2 className="font-heading font-bold text-base text-foreground">{user.full_name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{user.email}</p>
            <Badge
              variant="outline"
              className="mt-2 bg-surface text-foreground border-border text-[10px] font-bold uppercase tracking-wider"
            >
              {roleLabel}
            </Badge>

            <div
              className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                user.is_active
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`}
              />
              {user.is_active ? "Account Active" : "Account Inactive"}
            </div>
          </div>

          {/* Account Info Panel */}
          <div className="bg-card rounded-2xl border border-border/70 p-5 space-y-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Account Information
            </h3>
            <InfoRow icon={Hash} label="Account ID" value={user.id} />
            <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
            <InfoRow icon={ShieldCheck} label="Account Role" value={roleLabel} />
            <InfoRow
              icon={Mail}
              label="Status"
              value={user.is_active ? "Active" : "Inactive"}
            />
          </div>
        </div>

        {/* Right — Edit Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information Form */}
          <div className="bg-card rounded-2xl border border-border/70 p-6 sm:p-8">
            <div className="pb-5 border-b border-border/50 mb-6">
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gold" />
                <span>Personal Information</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Update your name and contact details below.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="portal-name" className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-error">*</span>
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="portal-name"
                    {...register("name")}
                    placeholder="Your full name"
                    className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                  />
                </div>
                {errors.name && (
                  <p className="text-error text-xs flex items-center gap-1 mt-1" role="alert">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Email — Read Only */}
              <div className="space-y-1.5">
                <Label htmlFor="portal-email" className="text-xs font-semibold text-foreground">
                  Email Address
                  <span className="text-muted-foreground font-normal ml-1.5">(read-only)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="portal-email"
                    type="email"
                    readOnly
                    {...register("email")}
                    className="pl-10 bg-surface/30 border-border/60 rounded-xl text-muted-foreground cursor-not-allowed font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="portal-phone" className="text-xs font-semibold text-foreground">
                  Phone Number
                  <span className="text-muted-foreground font-normal ml-1.5">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="portal-phone"
                    {...register("phone")}
                    placeholder="+94 77 000 0000"
                    className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-border/40 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
