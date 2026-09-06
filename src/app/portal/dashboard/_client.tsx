"use client";

import Link from "next/link";
import {
  User as UserIcon,
  Briefcase,
  Activity,
  Calendar,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, ActivityLog } from "@/types";

interface Props {
  user: User;
  recentActivity: ActivityLog[];
  servicesCount: number;
}

// ─── Action Label Formatter ───────────────────────────────────────────────────

function formatAction(action: string): string {
  const map: Record<string, string> = {
    update_profile: "Updated profile information",
    change_password: "Changed account password",
    toggle_status: "Account status changed",
    update_role: "Account role updated",
    login: "Signed in to account",
    signup: "Created account",
  };
  return map[action] ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

function QuickActionCard({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/70 hover:border-gold/40 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="h-10 w-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:text-dark transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-gold shrink-0 transition-colors" />
      </div>
    </Link>
  );
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────

export default function DashboardClient({ user, recentActivity, servicesCount }: Props) {
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = new Date(user.created_at).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const roleLabel =
    user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Client";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-1">
            Client Portal
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Welcome back, {user.full_name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s an overview of your AccBot account.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Avatar className="h-14 w-14 border-2 border-gold/30 shadow-md">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
            <AvatarFallback className="bg-gold/15 text-gold text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-foreground">{user.full_name}</p>
            <Badge
              variant="outline"
              className="bg-surface text-foreground border-border text-[10px] font-bold uppercase tracking-wider mt-1"
            >
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Account Status */}
        <div className="bg-card rounded-2xl border border-border/70 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account Status
            </p>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                user.is_active ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-heading text-foreground">
            {user.is_active ? "Active" : "Inactive"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Member since {memberSince}</p>
        </div>

        {/* Available Services */}
        <div className="bg-card rounded-2xl border border-border/70 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Available Services
            </p>
            <div className="h-8 w-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-heading text-foreground">{servicesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">AccBot service offerings</p>
        </div>

        {/* Activity */}
        <div className="bg-card rounded-2xl border border-border/70 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </p>
            <div className="h-8 w-8 rounded-lg bg-surface text-foreground flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-heading text-foreground">{recentActivity.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Events recorded on your account</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Account Info Card */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/70 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-heading text-foreground">Account Details</h2>
            <Link href="/portal/profile">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:text-gold hover:bg-gold/10 rounded-lg">
                Edit
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </p>
                <p className="text-sm font-semibold text-foreground truncate">{user.full_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground">@</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-mono text-foreground truncate">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">#</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-foreground">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm font-semibold text-foreground">{memberSince}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Account ID
            </p>
            <p className="text-[10px] font-mono text-muted-foreground break-all">{user.id}</p>
          </div>
        </div>

        {/* Recent Activity + Quick Actions */}
        <div className="lg:col-span-3 space-y-5">
          {/* Recent Activity */}
          <div className="bg-card rounded-2xl border border-border/70 p-6">
            <h2 className="text-sm font-bold font-heading text-foreground mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account actions will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors"
                  >
                    <div className="h-7 w-7 rounded-lg bg-card border border-border/70 flex items-center justify-center shrink-0">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {formatAction(log.action)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("en-LK", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold font-heading text-foreground mb-3">Quick Actions</h2>
            <div className="space-y-2.5">
              <QuickActionCard
                href="/portal/profile"
                icon={UserIcon}
                label="Update My Profile"
                description="Change your name, phone, or profile photo"
              />
              <QuickActionCard
                href="/portal/services"
                icon={Briefcase}
                label="View Services"
                description="Browse AccBot's accounting & advisory services"
              />
              <QuickActionCard
                href="/portal/support"
                icon={HelpCircle}
                label="Get Support"
                description="Send a message to the AccBot team"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center justify-between pt-2 pb-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          Need anything? Our team is always here to help.
        </p>
        <Link href="/portal/support">
          <Button variant="ghost" size="sm" className="text-xs text-gold hover:text-gold hover:bg-gold/10 rounded-lg gap-1">
            Contact Support
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
