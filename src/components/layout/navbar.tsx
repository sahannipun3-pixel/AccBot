"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, User as UserIcon, LogOut, LayoutDashboard,
  Wallet, Globe, ChevronDown, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, signOutUser } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavUser {
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);

  // Load user on path change
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({
            name: currentUser.full_name,
            email: currentUser.email,
            role: currentUser.role,
            avatar_url: currentUser.avatar_url,
          });
        } else {
          setUser(null);
        }
      } catch {
        // silently fail
      }
    }
    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      window.location.href = "/";
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    startTransition(() => setIsMobileMenuOpen(false));
  }, [pathname]);

  const initials = user
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-card/92 dark:bg-background/92 backdrop-blur-md border-b border-border shadow-sm shadow-black/5"
          : "bg-card/80 dark:bg-background/80 backdrop-blur-xs border-b border-border/60"
      )}
    >
      <div className="container-custom flex h-[72px] items-center justify-between">

        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                  isActive
                    ? "text-gold bg-gold/10 dark:bg-gold/15"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/70"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-gold rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right — Theme / Auth / User */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full border border-border bg-card hover:bg-muted/70 transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label="User profile menu"
                  >
                    <Avatar className="h-8 w-8 border border-gold/30">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                      <AvatarFallback className="bg-gold text-dark text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-foreground max-w-[120px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                }
              />
              <DropdownMenuContent className="w-60 mt-1 p-1.5 rounded-2xl shadow-xl border-border bg-card text-foreground" align="end">
                <DropdownMenuLabel className="font-normal py-3 px-3">
                  <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                {(user.role === "admin" || user.role === "super_admin") ? (
                  <>
                    <DropdownMenuItem
                      render={
                        <Link href="/admin" className="flex items-center gap-2.5 w-full px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors">
                          <Sparkles className="h-4 w-4 text-gold" />
                          <span className="text-xs font-bold text-foreground">Admin Console</span>
                        </Link>
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <Link href="/admin/profile" className="flex items-center gap-2.5 w-full px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">Admin Profile</span>
                        </Link>
                      }
                    />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      render={
                        <Link href="/portal/dashboard" className="flex items-center gap-2.5 w-full px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors">
                          <LayoutDashboard className="h-4 w-4 text-gold" />
                          <span className="text-xs font-medium text-foreground">Client Portal</span>
                        </Link>
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <Link href="/portal/profile" className="flex items-center gap-2.5 w-full px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">My Profile</span>
                        </Link>
                      }
                    />
                  </>
                )}
                <DropdownMenuItem
                  render={
                    <Link href="/expense-tracker" className="flex items-center gap-2.5 w-full px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Expense Tracker (LKR)</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link href="/accounts-web" className="flex items-center gap-2.5 w-full px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted transition-colors">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Accounts Web Ledger</span>
                    </Link>
                  }
                />
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-2.5 py-2 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-foreground/85 hover:text-foreground hover:bg-muted">
                  Log In
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="sm" className="font-bold shadow-xs">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Nav Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          {user && (
            <Link href="/profile" aria-label="My Profile">
              <Avatar className="h-8 w-8 border border-gold/30">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-gold text-dark text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:bg-muted">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px] bg-card text-foreground border-l border-border flex flex-col p-6 shadow-2xl"
            >
              <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>

              {/* Mobile menu header */}
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <Logo />
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1.5 py-6">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-gold/15 text-gold border-l-2 border-gold pl-3.5"
                          : "text-foreground/80 hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile auth */}
              <div className="mt-auto flex flex-col gap-2 pb-4 border-t border-border pt-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-muted/50 rounded-xl">
                      <Avatar className="h-9 w-9 border border-gold/30">
                        <AvatarFallback className="bg-gold text-dark font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {(user.role === "admin" || user.role === "super_admin") ? (
                      <>
                        <Link href="/admin" className="w-full">
                          <Button variant="outline" className="w-full justify-start text-xs font-bold text-gold border-gold/30 hover:bg-gold/10">
                            <Sparkles className="h-4 w-4 mr-2 text-gold" /> Admin Console
                          </Button>
                        </Link>
                        <Link href="/admin/profile" className="w-full">
                          <Button variant="ghost" className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground">
                            <UserIcon className="h-4 w-4 mr-2" /> Admin Profile
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/portal/dashboard" className="w-full">
                          <Button variant="outline" className="w-full justify-start text-xs font-semibold">
                            <LayoutDashboard className="h-4 w-4 mr-2 text-gold" /> Client Portal
                          </Button>
                        </Link>
                        <Link href="/portal/profile" className="w-full">
                          <Button variant="ghost" className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground">
                            <UserIcon className="h-4 w-4 mr-2" /> My Profile
                          </Button>
                        </Link>
                      </>
                    )}
                    <Link href="/expense-tracker" className="w-full">
                      <Button variant="ghost" className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Wallet className="h-4 w-4 mr-2" /> Expense Tracker (LKR)
                      </Button>
                    </Link>
                    <Link href="/accounts-web" className="w-full">
                      <Button variant="ghost" className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Globe className="h-4 w-4 mr-2" /> Accounts Web
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive mt-1"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full font-semibold">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/contact" className="w-full">
                      <Button className="w-full font-bold">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
