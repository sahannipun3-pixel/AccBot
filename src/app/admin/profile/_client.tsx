"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  KeyRound,
  User as UserIcon,
  Calendar,
  Lock,
  Save,
  ImagePlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/actions/users";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";
import type { User } from "@/types";

interface Props {
  user: User;
}

export default function AdminProfileClient({ user: initialUser }: Props) {
  const [user, setUser] = useState<User>(initialUser);
  const [name, setName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
      const updateRes = await updateProfile(user.id, { avatar_url: data.url });
      if (updateRes.success) {
        setUser((prev) => ({ ...prev, avatar_url: data.url }));
        toast.success("Profile photo updated!");
      }
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile(user.id, {
        full_name: name.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl || null,
      });

      if (res.success) {
        setUser((prev) => ({
          ...prev,
          full_name: name.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl || null,
        }));
        toast.success("Profile details saved successfully.");
      } else {
        toast.error(res.error ?? "Failed to update profile.");
      }
    } catch {
      toast.error("Unexpected error saving profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      const res = await changePassword(data);
      if (res.success) {
        toast.success("Password changed successfully.");
        resetPasswordForm();
      } else {
        toast.error(res.error ?? "Failed to change password.");
      }
    } catch {
      toast.error("Unexpected error updating password.");
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
          Admin Profile &amp; Security
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage your personal credentials, contact numbers, and account security.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-gold/30 shadow-md">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={user.full_name} />}
                <AvatarFallback className="bg-gold-50 text-gold text-xl font-bold">
                  {user.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-full bg-dark/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                title="Change Photo"
              >
                {avatarUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold font-heading text-foreground">{user.full_name}</h2>
                <Badge className="bg-gold-50 text-gold border-gold/20 text-[10px] font-bold">
                  {user.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                Registered on {new Date(user.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleProfileSave} className="pt-6 space-y-5">
          <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gold" />
            <span>Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Full Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-surface/50 border-border/80 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Contact Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 XX XXX XXXX"
                className="bg-surface/50 border-border/80 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Email Address (Read-only)</Label>
            <Input
              value={user.email}
              disabled
              className="bg-surface/30 border-border/60 rounded-xl text-xs text-muted-foreground font-mono cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isUpdatingProfile} className="rounded-xl text-xs flex items-center gap-1.5">
              {isUpdatingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Profile Details</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Password Change Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
        <div className="space-y-1 pb-4 border-b border-border/60">
          <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gold" />
            <span>Change Security Password</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Ensure your account uses a strong, unique password to safeguard admin privileges.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Current Password *</Label>
            <Input
              type="password"
              {...registerPassword("currentPassword")}
              placeholder="••••••••"
              className="bg-surface/50 border-border/80 rounded-xl text-xs"
            />
            {passwordErrors.currentPassword && (
              <p className="text-error text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>{passwordErrors.currentPassword.message}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">New Password *</Label>
              <Input
                type="password"
                {...registerPassword("newPassword")}
                placeholder="At least 6 characters"
                className="bg-surface/50 border-border/80 rounded-xl text-xs"
              />
              {passwordErrors.newPassword && (
                <p className="text-error text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{passwordErrors.newPassword.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Confirm New Password *</Label>
              <Input
                type="password"
                {...registerPassword("confirmPassword")}
                placeholder="Repeat new password"
                className="bg-surface/50 border-border/80 rounded-xl text-xs"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-error text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{passwordErrors.confirmPassword.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl text-xs flex items-center gap-1.5"
            >
              {isChangingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
