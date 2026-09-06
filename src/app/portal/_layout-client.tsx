"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User as UserIcon,
  Briefcase,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
  X,
  Shield,
  ExternalLink,
  Bell,
  Home,
  ChevronRight,
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

// ─── Navigation Structure ─────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", href: "/portal/profile", icon: UserIcon },
      { label: "Security", href: "/portal/security", icon: Shield },
    ],
  },
  {
    title: "Services",
    items: [{ label: "Our Services", href: "/portal/services", icon: Briefcase }],
  },
  {
    title: "Support",
    items: [{ label: "Help & Support", href: "/portal/support", icon: HelpCircle }],
  },
];

// ─── Breadcrumb Helper ────────────────────────────────────────────────────────

function getBreadcrumb(pathname: string): { parent: string; current: string } {
  const map: Record<string, { parent: string; current: string }> = {
    "/portal/dashboard": { parent: "Portal", current: "Dashboard" },
    "/portal/profile": { parent: "Account", current: "My Profile" },
    "/portal/security": { parent: "Account", current: "Security" },
    "/portal/services": { parent: "Services", current: "Our Services" },
    "/portal/support": { parent: "Support", current: "Help & Support" },
  };
  return map[pathname] ?? { parent: "Portal", current: "Client Area" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
  user: User;
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="block" onClick={onClick}>
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
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortalLayoutClient({ children, user }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
  };

  const breadcrumb = getBreadcrumb(pathname);

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface font-sans text-left">
      {/* ─── Desktop Sticky Sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          "bg-card border-r border-border/70 transition-all duration-300 hidden lg:flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 select-none shadow-[1px_0_8px_rgba(0,0,0,0.03)]",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between min-h-[4.5rem]">
          {!collapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <Logo showText={true} />
              <div className="flex flex-col min-w-0">
                <Badge
                  variant="outline"
                  className="bg-gold/15 text-gold border-gold/30 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 w-fit"
                >
                  Client Portal
                </Badge>
              </div>
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
            className="h-8 w-8 text-muted-foreground hover:text-gold rounded-lg hover:bg-surface shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")}
            />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5 scrollbar-thin scrollbar-thumb-border">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  item.href === "/portal/dashboard"
                    ? pathname === "/portal/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom panel */}
        <div className="p-3 border-t border-border/60 bg-surface/20 space-y-2">
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-gold hover:bg-card rounded-xl border border-transparent hover:border-border/60 transition-all",
              collapsed && "justify-center"
            )}
            title="Visit AccBot Website"
          >
            <Home className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Visit Website</span>}
          </Link>

          {!collapsed ? (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/70">
              <Avatar className="h-8 w-8 border border-gold/30 shrink-0">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                <AvatarFallback className="bg-gold/15 text-gold text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-7 w-7 text-muted-foreground hover:text-error hover:bg-error/10 shrink-0 rounded-lg"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-muted-foreground hover:text-error hover:bg-error/10 mx-auto flex"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* ─── Mobile Drawer Overlay ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col justify-between transition-transform duration-300 lg:hidden shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Portal navigation"
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-border/60 min-h-[4.5rem]">
            <div className="flex items-center gap-3">
              <Logo showText={true} />
              <Badge
                variant="outline"
                className="bg-gold/15 text-gold border-gold/30 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5"
              >
                Client Portal
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="h-8 w-8 rounded-lg"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-3 py-5 space-y-5 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-0.5">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/portal/dashboard"
                      ? pathname === "/portal/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      collapsed={false}
                      onClick={() => setMobileOpen(false)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border/60 space-y-3">
          <Link
            href="/"
            target="_blank"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-gold rounded-xl hover:bg-surface transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>Visit AccBot Website</span>
          </Link>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/60 border border-border/70">
            <Avatar className="h-9 w-9 border border-gold/30 shrink-0">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
              <AvatarFallback className="bg-gold/15 text-gold text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{user.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
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

      {/* ─── Main Content Wrapper ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border/70 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 h-[4.5rem]">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 lg:hidden rounded-xl border-border/80 bg-card"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium hidden sm:inline">
                {breadcrumb.parent}
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 hidden sm:inline" />
              <span className="text-foreground font-semibold">{breadcrumb.current}</span>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notification bell — placeholder for future */}
            <button
              type="button"
              className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center hover:border-gold/50 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface border border-transparent hover:border-border/60 transition-all cursor-pointer"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8 border border-gold/30">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                      <AvatarFallback className="bg-gold/15 text-gold font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-foreground leading-tight">{user.full_name}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">Client Account</span>
                    </div>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="px-3 py-2 font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold leading-none text-foreground">{user.full_name}</p>
                    <p className="text-[11px] leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link
                      href="/portal/profile"
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl cursor-pointer"
                    >
                      <UserIcon className="h-4 w-4 text-gold" />
                      <span className="text-xs">My Profile</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link
                      href="/portal/security"
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl cursor-pointer"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="text-xs">Security</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link
                      href="/"
                      target="_blank"
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-xs">Visit Website</span>
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

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
