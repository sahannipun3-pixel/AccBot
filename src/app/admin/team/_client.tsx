"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  AlertTriangle,
  ImagePlus,
  Loader2,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberStatus,
} from "@/actions/team";
import { teamMemberSchema, type TeamMemberFormData } from "@/lib/validators";
import type { TeamMember } from "@/types";

interface Props {
  initialMembers: TeamMember[];
}

export default function AdminTeamClient({ initialMembers }: Props) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      linkedin_url: "",
      sort_order: 0,
      is_active: true,
    },
  });

  const isActiveValue = watch("is_active");

  const openCreateDialog = () => {
    setFormMode("create");
    setEditingId(null);
    setAvatarPreview("");
    reset({
      name: "",
      role: "",
      bio: "",
      linkedin_url: "",
      sort_order: members.length,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setFormMode("edit");
    setEditingId(member.id);
    setAvatarPreview(member.avatar_url ?? "");
    reset({
      name: member.name,
      role: member.role,
      bio: member.bio,
      linkedin_url: member.linkedin_url ?? "",
      sort_order: member.sort_order,
      is_active: member.is_active,
    });
    setDialogOpen(true);
  };

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
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "team");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");

      setAvatarPreview(data.url);
      toast.success("Profile photo uploaded!");
    } catch {
      toast.error("Failed to upload photo.");
      setAvatarPreview("");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFormSubmit = async (data: TeamMemberFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        role: data.role.trim(),
        bio: data.bio.trim(),
        linkedin_url: data.linkedin_url || null,
        sort_order: Number(data.sort_order) || 0,
        is_active: data.is_active,
        avatar_url: avatarPreview || null,
      };

      if (formMode === "create") {
        const result = await createTeamMember(payload);
        if (result.success) {
          toast.success("Team member added!");
          setMembers((prev) => [
            ...prev,
            {
              id: result.id!,
              ...payload,
              created_at: new Date().toISOString(),
            },
          ]);
          setDialogOpen(false);
        } else {
          toast.error(result.error ?? "Failed to add team member.");
        }
      } else if (editingId) {
        const result = await updateTeamMember(editingId, payload);
        if (result.success) {
          toast.success("Team member updated!");
          setMembers((prev) =>
            prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m))
          );
          setDialogOpen(false);
        } else {
          toast.error(result.error ?? "Failed to update team member.");
        }
      }
    } catch {
      toast.error("Unexpected error saving team member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    setLoadingId(member.id);
    try {
      const result = await toggleTeamMemberStatus(member.id);
      if (result.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, is_active: result.is_active ?? !m.is_active } : m
          )
        );
        toast.success(result.is_active ? "Member activated!" : "Member deactivated.");
      } else {
        toast.error(result.error ?? "Failed to toggle status.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      const result = await deleteTeamMember(deletingMember.id);
      if (result.success) {
        setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
        toast.success("Team member removed.");
        setDeletingMember(null);
      } else {
        toast.error(result.error ?? "Failed to delete team member.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.bio.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && m.is_active) ||
      (statusFilter === "inactive" && !m.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Advisory Team Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Manage partners, chartered accountants, and tax advisors shown on the public About page.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2 rounded-xl shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Member</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, role, bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/80 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center p-1 bg-surface border border-border/80 rounded-xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  statusFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                All ({members.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  statusFilter === "active" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Active ({activeCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter("inactive")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  statusFilter === "inactive" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Inactive ({members.length - activeCount})
              </Button>
            </div>
          </div>

          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            {activeCount} of {members.length} active
          </span>
        </div>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-20 text-center px-4">
              <UserCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-sm text-foreground">No advisory team members found</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                {search || statusFilter !== "all"
                  ? "Try resetting your search filter."
                  : "Click 'Add Member' above to create advisory staff profiles."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground font-heading">Advisory Member</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Role / Title</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">LinkedIn</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Status</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Order</TableHead>
                  <TableHead className="text-right font-semibold text-foreground font-heading">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <TableRow key={member.id} className="hover:bg-surface/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="h-10 w-10 object-cover rounded-full shrink-0 border border-gold/20"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-surface rounded-full shrink-0 flex items-center justify-center border border-border">
                            <span className="text-xs font-bold text-muted-foreground">
                              {member.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{member.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {member.bio}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-foreground/80 font-semibold">{member.role}</TableCell>

                    <TableCell>
                      {member.linkedin_url ? (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:underline flex items-center gap-1 text-xs font-medium"
                        >
                          <span>Profile</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          member.is_active
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }
                        variant="outline"
                      >
                        {member.is_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">#{member.sort_order}</TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === member.id}
                          onClick={() => openEditDialog(member)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title="Edit Member"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === member.id}
                          onClick={() => handleToggleStatus(member)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title={member.is_active ? "Deactivate" : "Activate"}
                        >
                          {member.is_active ? (
                            <ToggleRight className="h-4 w-4 text-success" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === member.id}
                          onClick={() => setDeletingMember(member)}
                          className="h-8 w-8 rounded-lg hover:border-error hover:text-error"
                          title="Delete Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden">
          <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light sticky top-0 z-10" />
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/60">
            <DialogTitle className="font-heading font-bold text-xl text-foreground">
              {formMode === "create" ? "Add Advisory Member" : "Edit Advisory Member"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide team credentials, qualifications, biography, and professional photo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-5 space-y-4">
            {/* Photo Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Profile Photo</Label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border border-gold/20 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-surface border border-border/80 flex items-center justify-center shrink-0">
                    <UserCheck className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl text-xs"
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5" />
                    )}
                    <span>{avatarUploading ? "Uploading..." : "Upload photo"}</span>
                  </Button>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">JPEG, PNG, WebP • Max 5MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Sahan Perera"
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
                {errors.name && (
                  <p className="text-error text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold text-foreground">
                  Position / Role *
                </Label>
                <Input
                  id="role"
                  {...register("role")}
                  placeholder="e.g. Managing Director & Senior Partner"
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
                {errors.role && (
                  <p className="text-error text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.role.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* LinkedIn + Sort Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin_url" className="text-xs font-semibold text-foreground">
                  LinkedIn Profile URL
                </Label>
                <Input
                  id="linkedin_url"
                  {...register("linkedin_url")}
                  placeholder="https://linkedin.com/in/username"
                  className="bg-surface/50 border-border/80 rounded-xl font-mono text-xs"
                />
                {errors.linkedin_url && (
                  <p className="text-error text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.linkedin_url.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sort_order" className="text-xs font-semibold text-foreground">
                  Display Order
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...register("sort_order", { valueAsNumber: true })}
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-semibold text-foreground">
                Professional Biography *
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                rows={3}
                placeholder="Fellow Chartered Accountant with 15+ years experience in corporate restructuring and tax advisory..."
                className="bg-surface/50 border-border/80 rounded-xl resize-none text-xs leading-relaxed"
              />
              {errors.bio && (
                <p className="text-error text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.bio.message}</span>
                </p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
              <Checkbox
                id="is_active"
                checked={isActiveValue}
                onCheckedChange={(checked) => setValue("is_active", !!checked)}
              />
              <Label htmlFor="is_active" className="text-xs font-semibold text-foreground cursor-pointer">
                Display member immediately on public website team list
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl text-xs">
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                {formMode === "create" ? "Add Member" : "Save Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Delete Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete <strong className="text-foreground">&quot;{deletingMember?.name}&quot;</strong>? This will remove them from the public About Us page.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingMember(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs flex items-center gap-1.5"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Delete Member</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
