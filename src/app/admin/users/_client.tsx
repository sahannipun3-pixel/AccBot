"use client";

import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  UserCheck,
  Shield,
  Trash2,
  Eye,
  Pencil,
  AlertTriangle,
  Loader2,
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, toggleUserStatus, deleteUser, updateProfile } from "@/actions/users";
import type { User, UserRole } from "@/types";

interface Props {
  initialUsers: User[];
  total: number;
}

export default function AdminUsersClient({ initialUsers, total }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // View modal state
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete modal state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.full_name);
    setEditPhone(user.phone ?? "");
    setEditRole(user.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingEdit(true);

    try {
      // 1. Update role if changed
      if (editRole !== editingUser.role) {
        const roleRes = await updateUserRole(editingUser.id, editRole);
        if (!roleRes.success) {
          toast.error(roleRes.error ?? "Failed to update role.");
          setIsSubmittingEdit(false);
          return;
        }
      }

      // 2. Update profile fields
      const profileRes = await updateProfile(editingUser.id, {
        full_name: editName.trim(),
        phone: editPhone.trim() || null,
      });

      if (profileRes.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  full_name: editName.trim(),
                  phone: editPhone.trim() || null,
                  role: editRole,
                  updated_at: new Date().toISOString(),
                }
              : u
          )
        );
        toast.success("User account updated successfully.");
        setEditingUser(null);
      } else {
        toast.error(profileRes.error ?? "Failed to update profile details.");
      }
    } catch {
      toast.error("Unexpected error saving user changes.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setLoadingId(userId);
    try {
      const result = await toggleUserStatus(userId);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_active: result.is_active ?? !u.is_active } : u
          )
        );
        toast.success(result.is_active ? "User account activated." : "User account deactivated.");
      } else {
        toast.error(result.error ?? "Failed to toggle status.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const result = await deleteUser(deletingUser.id);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        toast.success("User account deleted successfully.");
        setDeletingUser(null);
      } else {
        toast.error(result.error ?? "Failed to delete user.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            User Accounts &amp; Clients
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Manage authenticated client profiles, assign security roles, and inspect account statuses.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/80 rounded-xl text-xs"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admins</option>
              <option value="admin">Admins</option>
              <option value="user">Standard Users</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            Showing {filteredUsers.length} of {total} registered users
          </span>
        </div>

        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="py-20 text-center px-4">
              <UserIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-sm text-foreground">No user accounts found</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                {search || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try resetting your search or filter parameters."
                  : "Registered user accounts will appear here."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground font-heading">User Profile</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Role Privilege</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Status</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Contact Phone</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Registered</TableHead>
                  <TableHead className="text-right font-semibold text-foreground font-heading">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-surface/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm text-foreground">{user.full_name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "super_admin"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            : user.role === "admin"
                            ? "bg-gold-50 text-gold border-gold/20"
                            : "bg-surface text-foreground/80 border-border"
                        }
                        variant="outline"
                      >
                        {user.role === "super_admin"
                          ? "SUPER ADMIN"
                          : user.role === "admin"
                          ? "ADMIN"
                          : "USER"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }
                        variant="outline"
                      >
                        {user.is_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80 font-medium">
                      {user.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setViewingUser(user)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title="View Profile Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openEditModal(user)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title="Edit User Role / Details"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === user.id || user.role === "super_admin"}
                          onClick={() => handleToggleStatus(user.id)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold disabled:opacity-40"
                          title={user.is_active ? "Deactivate User" : "Activate User"}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === user.id || user.role === "super_admin"}
                          onClick={() => setDeletingUser(user)}
                          className="h-8 w-8 rounded-lg hover:border-error hover:text-error disabled:opacity-40"
                          title="Delete User"
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

      {/* View User Details Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-4 border-b border-border/60">
            <DialogTitle className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gold" />
              <span>User Profile Details</span>
            </DialogTitle>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50">
                <span className="font-bold text-muted-foreground">Account Status</span>
                <Badge
                  variant="outline"
                  className={
                    viewingUser.is_active
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  }
                >
                  {viewingUser.is_active ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-foreground">
                  <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-bold">Full Name:</span>
                  <span>{viewingUser.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-bold">Email Address:</span>
                  <span className="font-mono">{viewingUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-bold">Phone:</span>
                  <span>{viewingUser.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-bold">Assigned Role:</span>
                  <span className="uppercase font-semibold text-gold">{viewingUser.role}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-bold">Registered On:</span>
                  <span>{new Date(viewingUser.created_at).toLocaleString("en-AE")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 flex justify-end">
                <Button variant="outline" onClick={() => setViewingUser(null)} className="rounded-xl">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-4 border-b border-border/60">
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Edit User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify account roles and profile details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Full Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="bg-surface/50 border-border/80 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Phone Number</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+971 XX XXX XXXX"
                className="bg-surface/50 border-border/80 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Security Role Privilege</Label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full h-10 rounded-xl border border-border/80 bg-surface/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                <option value="user">Standard User (Portal access)</option>
                <option value="admin">Administrator (CMS &amp; Inquiries)</option>
                <option value="super_admin">Super Administrator (Full System)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingEdit} className="rounded-xl text-xs">
                {isSubmittingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Delete User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to permanently delete the account for{" "}
              <strong className="text-foreground">{deletingUser?.full_name}</strong> ({deletingUser?.email})?
              This operation cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingUser(null)}
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
              <span>Delete Permanently</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
