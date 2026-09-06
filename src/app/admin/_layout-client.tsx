"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users as UsersIcon,
  Briefcase,
  Mail,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  ChevronLeft,
  X,
  FileText,
  UserCheck,
  Star,
  Activity,
  Receipt,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Bell,
  Search,
  User as UserAvatarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { signOutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "unreadMessages" | "pendingExpenses";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { label: "Users & Clients", href: "/admin/users", icon: UsersIcon },
      {
        label: "Contact Inquiries",
        href: "/admin/messages",
        icon: Mail,
        badgeKey: "unreadMessages",
      },
      { label: "Services CMS", href: "/admin/services", icon: Briefcase },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blog / Articles", href: "/admin/blog", icon: FileText },
      { label: "Testimonials", href: "/admin/testimonials", icon: Star },
      { label: "Advisory Team", href: "/admin/team", icon: UserCheck },
    ],
  },
  {
    title: "Financial Modules",
    items: [
      {
        label: "Expense Reviews",
        href: "/expense-tracker",
        icon: Receipt,
        badgeKey: "pendingExpenses",
      },
      { label: "Accounts Ledger", href: "/accounts-web", icon: BookOpen },
    ],
  },
  {
    title: "System & Audit",
    items: [
      { label: "Website Settings", href: "/admin/settings", icon: SettingsIcon },
      { label: "Activity Audit Logs", href: "/admin/activity", icon: Activity },
      { label: "Admin Profile", href: "/admin/profile", icon: ShieldCheck },
    ],
  },
];

interface Props {
  children: React.ReactNode;
  user: User;
  unreadMessages?: number;
  pendingExpenses?: number;
}

export default function AdminLayoutClient({
  children,
  user,
  unreadMessages = 0,
  pendingExpenses = 0,
}: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
  };

  const getBadgeValue = (key?: "unreadMessages" | "pendingExpenses") => {
    if (key === "unreadMessages" && unreadMessages > 0) return unreadMessages;
    if (key === "pendingExpenses" && pendingExpenses > 0) return pendingExpenses;
    return null;
  };

  // Compute current section name for top bar breadcrumb
  const getCurrentSectionTitle = () => {
    if (pathname === "/admin") return "Operational Overview";
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname.startsWith(item.href) && item.href !== "/admin") {
          return item.label;
        }
      }
    }
    return "Admin Portal";
  };

  const totalNotifications = unreadMessages + pendingExpenses;

  return (
    <div className="flex min-h-screen bg-surface font-sans text-left">
      {/* ─── Desktop Sticky Sidebar ────────────────────────────────────────── */}
      <aside
        className={cn(
          "bg-card border-r border-border/70 transition-all duration-300 hidden lg:flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {/* Top brand header */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between min-h-[4.5rem]">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Logo showText={true} />
              <Badge
                variant="outline"
                className="bg-gold-50 text-gold border-gold/20 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5"
              >
                {user.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
              </Badge>
            </div>
          ) : (
            <div className="mx-auto">
              <Logo showText={false} />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-gold rounded-lg hover:bg-surface"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")}
            />
          </Button>
        </div>

        {/* Navigation scroll area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-border">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-2">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const badge = getBadgeValue(item.badgeKey);

                return (
                  <Link key={item.href} href={item.href} className="block">
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                        isActive
                          ? "bg-gold text-dark font-bold shadow-sm shadow-gold/20"
                          : "text-foreground hover:text-gold hover:bg-surface/80",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-dark" : "text-muted-foreground group-hover:text-gold"
                        )}
                      />
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && badge !== null && (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-bold rounded-full",
                            isActive
                              ? "bg-dark text-white"
                              : "bg-gold-50 text-gold border border-gold/30"
                          )}
                        >
                          {badge}
                        </span>
                      )}
                      {collapsed && badge !== null && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom profile & action panel */}
        <div className="p-3 border-t border-border/60 bg-surface/30 space-y-2">
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-gold hover:bg-card rounded-xl border border-transparent hover:border-border/60 transition-all",
              collapsed && "justify-center"
            )}
            title="View Live Public Website"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View Public Site</span>}
          </Link>

          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 border border-gold/30">
                  {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                  <AvatarFallback className="bg-gold-50 text-gold text-xs font-bold">
                    {user.full_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate leading-tight">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-muted-foreground hover:text-error hover:bg-error/10 shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-muted-foreground hover:text-error hover:bg-error/10 mx-auto"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* ─── Mobile Slide-out Drawer ───────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-dark/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col justify-between p-4 transition-transform duration-300 lg:hidden shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <Logo showText={true} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const badge = getBadgeValue(item.badgeKey);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gold text-dark font-bold shadow-sm"
                          : "text-foreground hover:text-gold hover:bg-surface"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {badge !== null && (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-bold rounded-full",
                            isActive ? "bg-dark text-white" : "bg-gold-50 text-gold"
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/60 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-gold rounded-xl"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Public Site</span>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 justify-start text-error hover:bg-error/10 hover:text-error rounded-xl py-2.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border/70 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 lg:hidden rounded-xl border-border bg-card"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Breadcrumb / title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span>AccBot Admin</span>
                <span>/</span>
                <span className="text-gold font-semibold">{getCurrentSectionTitle()}</span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Live Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="h-9 w-9 rounded-xl border border-border bg-card flex items-center justify-center relative hover:border-gold/50 cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {totalNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-dark text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                        {totalNotifications}
                      </span>
                    )}
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Activity Alerts ({totalNotifications})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {totalNotifications === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    All caught up! No unread inquiries or pending approvals.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {unreadMessages > 0 && (
                      <DropdownMenuItem
                        render={
                          <Link href="/admin/messages" className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer w-full">
                            <div className="h-8 w-8 rounded-lg bg-gold-50 text-gold flex items-center justify-center shrink-0">
                              <Mail className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {unreadMessages} Unread Contact {unreadMessages === 1 ? "Inquiry" : "Inquiries"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Click to review customer messages.
                              </p>
                            </div>
                          </Link>
                        }
                      />
                    )}
                    {pendingExpenses > 0 && (
                      <DropdownMenuItem
                        render={
                          <Link href="/expense-tracker" className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer w-full">
                            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                              <Receipt className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {pendingExpenses} Pending Expense {pendingExpenses === 1 ? "Approval" : "Approvals"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Click to verify and approve expenses.
                              </p>
                            </div>
                          </Link>
                        }
                      />
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2.5 px-2 py-1.5 h-auto rounded-xl hover:bg-surface border border-transparent hover:border-border/60 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 border border-gold/30">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                      <AvatarFallback className="bg-gold-50 text-gold font-bold text-xs">
                        {user.full_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-foreground leading-tight">{user.full_name}</span>
                      <span className="text-[10px] text-gold font-semibold uppercase leading-tight">
                        {user.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </div>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="px-3 py-2 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold leading-none text-foreground">{user.full_name}</p>
                    <p className="text-[11px] leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link href="/admin/profile" className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl cursor-pointer">
                      <ShieldCheck className="h-4 w-4 text-gold" />
                      <span className="text-xs">Admin Profile &amp; Security</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link href="/admin/settings" className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl cursor-pointer">
                      <SettingsIcon className="h-4 w-4" />
                      <span className="text-xs">Portal Settings</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link href="/admin/activity" className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl cursor-pointer">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs">Activity Audit Logs</span>
                    </Link>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl text-error focus:bg-error/10 focus:text-error cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="text-xs font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
