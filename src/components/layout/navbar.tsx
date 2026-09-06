"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, User as UserIcon, LogOut, LayoutDashboard,
  Wallet, Globe, ChevronDown,
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
          ? "bg-dark/97 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20"
          : "bg-dark border-b border-white/5"
      )}
    >
      <div className="container-custom flex h-[72px] items-center justify-between">

        {/* Logo */}
        <Logo textClassName="text-white" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-[13.5px] font-medium rounded-lg transition-colors duration-200",
                  isActive
                    ? "text-gold"
                    : "text-white/75 hover:text-white hover:bg-white/6"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gold rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right — Auth / User */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className="bg-white/5 border-white/10 hover:bg-white/10 text-white" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                      <AvatarFallback className="bg-gold text-dark text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[13px] font-medium text-white/90 max-w-[120px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                  </button>
                }
              />
              <DropdownMenuContent className="w-60 mt-1" align="end">
                <DropdownMenuLabel className="font-normal py-3">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{user.name}</p>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link href="/profile" className="flex items-center gap-2.5 w-full px-2 py-2 cursor-pointer">
                      <UserIcon className="h-4 w-4 text-gold" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link href="/expense-tracker" className="flex items-center gap-2.5 w-full px-2 py-2 cursor-pointer">
                      <Wallet className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm">Expense Tracker</span>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link href="/accounts-web" className="flex items-center gap-2.5 w-full px-2 py-2 cursor-pointer">
                      <Globe className="h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm">Accounts Web</span>
                    </Link>
                  }
                />
                {(user.role === "admin" || user.role === "super_admin") && (
                  <DropdownMenuItem
                    render={
                      <Link href="/admin" className="flex items-center gap-2.5 w-full px-2 py-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 text-[#6B7280]" />
                        <span className="text-sm">Admin Panel</span>
                      </Link>
                    }
                  />
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-2 py-2 text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost-dark" size="sm" className="text-white/80 hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="sm" className="font-semibold">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Nav Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-9 w-9" />
          {user && (
            <Link href="/profile">
              <Avatar className="h-8 w-8">
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
                <Button variant="ghost-dark" size="icon" className="h-10 w-10 text-white">
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px] bg-dark text-white border-l border-white/8 flex flex-col"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Mobile menu header */}
              <div className="flex items-center justify-between pt-2 pb-6 border-b border-white/8">
                <Logo textClassName="text-white" />
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 py-6">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
                        isActive
                          ? "bg-gold/10 text-gold border-l-2 border-gold pl-3"
                          : "text-white/75 hover:text-white hover:bg-white/6"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile auth */}
              <div className="mt-auto flex flex-col gap-2 pb-8 border-t border-white/8 pt-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gold text-dark font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/profile" className="w-full">
                      <Button variant="outline" className="w-full border-white/15 bg-transparent text-white hover:bg-white/8 hover:text-white hover:border-white/25">
                        My Profile
                      </Button>
                    </Link>
                    <Link href="/expense-tracker" className="w-full">
                      <Button variant="ghost-dark" className="w-full justify-start text-white/70">
                        <Wallet className="h-4 w-4 mr-2" /> Expense Tracker
                      </Button>
                    </Link>
                    <Link href="/accounts-web" className="w-full">
                      <Button variant="ghost-dark" className="w-full justify-start text-white/70">
                        <Globe className="h-4 w-4 mr-2" /> Accounts Web
                      </Button>
                    </Link>
                    {(user.role === "admin" || user.role === "super_admin") && (
                      <Link href="/admin" className="w-full">
                        <Button variant="ghost-dark" className="w-full justify-start text-white/70">
                          <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-400 mt-1"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full border-white/15 bg-transparent text-white hover:bg-white/8 hover:text-white">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/contact" className="w-full">
                      <Button className="w-full">Get Started</Button>
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
