"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Save,
  LogOut,
  Wallet,
  Globe,
  ArrowRight,
  AlertCircle,
  Shield,
  ExternalLink,
} from "lucide-react";
import { profileSchema, type ProfileFormData } from "@/lib/validators";
import { signOutUser } from "@/actions/auth";
import { updateProfile } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

interface Props {
  user: UserType;
}

export default function ProfileClient({ user }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState(user.full_name);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url);

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

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(user.id, {
        full_name: data.name,
        phone: data.phone || null,
      });

      if (result.success) {
        setDisplayName(data.name);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error ?? "Failed to update profile.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const roleLabel = user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "User";
  const roleBadgeClass =
    user.role === "super_admin"
      ? "bg-red-500/10 text-red-500 border-red-500/20"
      : user.role === "admin"
      ? "bg-gold/15 text-gold border-gold/30"
      : "bg-surface text-foreground border-border";

  return (
    <div className="section-padding bg-background min-h-[85vh]">
      <div className="container-custom max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border/80 bg-card rounded-2xl p-6 text-center shadow-sm">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                displayName={displayName}
                onUploadSuccess={(url) => setAvatarUrl(url)}
              />

              <h2 className="font-heading font-bold text-lg text-foreground">{displayName}</h2>
              <Badge className={`${roleBadgeClass} mt-2 text-xs font-bold uppercase tracking-wider`} variant="outline">
                {roleLabel}
              </Badge>

              {(user.role === "admin" || user.role === "super_admin") && (
                <Link href="/admin" className="w-full block mt-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between group border-gold/30 hover:border-gold hover:bg-gold/10"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gold" />
                      <span className="text-xs font-bold">Admin Management</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
                  </Button>
                </Link>
              )}

              <div className="pt-6 border-t border-border/50 flex flex-col gap-3 mt-6">
                <Link href="/accounts-web" className="w-full">
                  <Button variant="outline" className="w-full flex items-center justify-between group">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Accounts Web</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full text-error hover:bg-error/10 hover:text-error mt-2 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Forms Card */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border border-border/80 bg-card rounded-2xl p-6 sm:p-8 shadow-sm">
              <CardHeader className="p-0 pb-6 border-b border-border/50">
                <h3 className="font-heading font-bold text-xl text-foreground">Profile Settings</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Update your contact details and account information below.
                </p>
              </CardHeader>

              <CardContent className="p-0 pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          {...register("name")}
                          className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-error text-xs flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address (Read-only)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                          id="email"
                          type="email"
                          readOnly
                          {...register("email")}
                          className="pl-10 bg-surface/30 border-border/80 rounded-xl text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          {...register("phone")}
                          placeholder="+94 77 000 0000"
                          className="pl-10 bg-surface/50 border-border/80 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="flex items-center gap-2 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
