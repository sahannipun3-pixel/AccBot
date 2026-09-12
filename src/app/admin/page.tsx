import Link from "next/link";
import {
  Users,
  Mail,
  Briefcase,
  FileText,
  Star,
  UserCheck,
  Receipt,
  BookOpen,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Activity as ActivityIcon,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { sql } from "@/lib/db";
import { getRecentMessages } from "@/actions/messages";
import { getRecentActivity } from "@/actions/activity";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [statsResult, recentMessages, recentActivity] = await Promise.all([
    sql<{
      total_users: string;
      total_messages: string;
      unread_messages: string;
      active_services: string;
      total_services: string;
      published_blog_posts: string;
      total_blog_posts: string;
      active_team_members: string;
      active_testimonials: string;
      pending_expenses: string;
      total_accounts: string;
    }[]>`
      SELECT
        (SELECT COUNT(*)::text FROM users) as total_users,
        (SELECT COUNT(*)::text FROM contact_messages) as total_messages,
        (SELECT COUNT(*)::text FROM contact_messages WHERE is_read = false) as unread_messages,
        (SELECT COUNT(*)::text FROM services WHERE is_active = true) as active_services,
        (SELECT COUNT(*)::text FROM services) as total_services,
        (SELECT COUNT(*)::text FROM blog_posts WHERE is_published = true) as published_blog_posts,
        (SELECT COUNT(*)::text FROM blog_posts) as total_blog_posts,
        (SELECT COUNT(*)::text FROM team_members WHERE is_active = true) as active_team_members,
        (SELECT COUNT(*)::text FROM testimonials WHERE is_active = true) as active_testimonials,
        (SELECT COUNT(*)::text FROM expenses WHERE status = 'pending') as pending_expenses,
        (SELECT COUNT(*)::text FROM accounts WHERE is_active = true) as total_accounts;
    `.catch((err) => {
      console.error("[ADMIN] Failed to fetch consolidated statistics:", err);
      return [{
        total_users: "0",
        total_messages: "0",
        unread_messages: "0",
        active_services: "0",
        total_services: "0",
        published_blog_posts: "0",
        total_blog_posts: "0",
        active_team_members: "0",
        active_testimonials: "0",
        pending_expenses: "0",
        total_accounts: "0",
      }];
    }),
    getRecentMessages(5),
    getRecentActivity(6),
  ]);

  const stats = statsResult[0];
  const totalUsers = parseInt(stats?.total_users ?? "0", 10);
  const totalMessages = parseInt(stats?.total_messages ?? "0", 10);
  const unreadMessages = parseInt(stats?.unread_messages ?? "0", 10);
  const activeServices = parseInt(stats?.active_services ?? "0", 10);
  const totalServices = parseInt(stats?.total_services ?? "0", 10);
  const publishedBlogPosts = parseInt(stats?.published_blog_posts ?? "0", 10);
  const totalBlogPosts = parseInt(stats?.total_blog_posts ?? "0", 10);
  const activeTeamMembers = parseInt(stats?.active_team_members ?? "0", 10);
  const activeTestimonials = parseInt(stats?.active_testimonials ?? "0", 10);
  const pendingExpenses = parseInt(stats?.pending_expenses ?? "0", 10);
  const totalAccounts = parseInt(stats?.total_accounts ?? "0", 10);


  const kpis = [
    {
      title: "Registered Users",
      value: totalUsers,
      subtext: `${totalUsers} total registered accounts`,
      href: "/admin/users",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Contact Inquiries",
      value: totalMessages,
      subtext: unreadMessages > 0 ? `${unreadMessages} awaiting response` : "All inquiries resolved",
      href: "/admin/messages",
      icon: Mail,
      badge: unreadMessages > 0 ? `${unreadMessages} new` : null,
      color: "text-gold bg-gold/15 border-gold/30",
    },
    {
      title: "Active Services",
      value: activeServices,
      subtext: `${totalServices} total configured`,
      href: "/admin/services",
      icon: Briefcase,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Blog Articles",
      value: publishedBlogPosts,
      subtext: `${totalBlogPosts - publishedBlogPosts} drafts in progress`,
      href: "/admin/blog",
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Client Testimonials",
      value: activeTestimonials,
      subtext: "Active website reviews",
      href: "/admin/testimonials",
      icon: Star,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Advisory Team",
      value: activeTeamMembers,
      subtext: "Chartered & tax experts",
      href: "/admin/team",
      icon: UserCheck,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Pending Expenses",
      value: pendingExpenses,
      subtext: pendingExpenses > 0 ? "Requires admin review" : "No pending claims",
      href: "/expense-tracker",
      icon: Receipt,
      badge: pendingExpenses > 0 ? "Action needed" : null,
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Chart of Accounts",
      value: totalAccounts,
      subtext: "Ledger heads active",
      href: "/accounts-web",
      icon: BookOpen,
      color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Top Welcome & Operational Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 sm:p-8 rounded-2xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Production Database Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl leading-relaxed">
            Monitor real-time company metrics, manage customer inquiries, publish services and articles, and review financial operations.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap gap-2.5 z-10">
          <Link href="/admin/services">
            <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>New Service</span>
            </Button>
          </Link>
          <Link href="/admin/blog">
            <Button size="sm" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Write Article</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (8 Core Real Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.title} href={kpi.href} className="group">
              <Card className="h-full border border-border/80 bg-card rounded-2xl p-5 shadow-xs hover:border-gold/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${kpi.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-extrabold font-heading text-foreground group-hover:text-gold transition-colors">
                      {formatNumber(kpi.value)}
                    </h3>
                    {kpi.badge && (
                      <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px] font-bold">
                        {kpi.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                    <span>{kpi.subtext}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Inquiries (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">Recent Contact Inquiries</h3>
                <p className="text-xs text-muted-foreground">Inquiries submitted via website contact form</p>
              </div>
              <Link href="/admin/messages">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-gold hover:text-gold-dark flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentMessages.length === 0 ? (
                <div className="py-16 text-center px-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-bold text-sm text-foreground">No contact enquiries yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                    When customers submit the contact form, their inquiries will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-5 flex items-start justify-between gap-4 hover:bg-surface/30 transition-colors ${
                        !msg.is_read ? "bg-gold/5 dark:bg-gold/10" : ""
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-sm text-foreground truncate">
                            {msg.name}
                          </h4>
                          {!msg.is_read ? (
                            <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px] font-extrabold px-1.5 py-0">
                              NEW
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-success" /> Read
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-muted-foreground font-medium block">
                          {new Date(msg.created_at).toLocaleDateString("en-LK", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Link
                          href="/admin/messages"
                          className="text-xs font-semibold text-gold hover:underline inline-block mt-2"
                        >
                          Open &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Real Activity Logs & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Audit Log */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">Activity Audit Trail</h3>
                <p className="text-xs text-muted-foreground">Recent administrative events</p>
              </div>
              <Link href="/admin/activity">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-gold hover:text-gold-dark flex items-center gap-1">
                  <span>Full Audit</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-5">
              {recentActivity.length === 0 ? (
                <div className="py-12 text-center">
                  <ActivityIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="font-semibold text-xs text-muted-foreground">No recent administrative activity</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    Operations like editing services or managing users will be logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-left">
                      <div className="h-7 w-7 rounded-lg bg-surface border border-border/80 flex items-center justify-center text-gold shrink-0 mt-0.5">
                        <ActivityIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-foreground truncate">
                            {log.action.replace(/_/g, " ").toUpperCase()}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleDateString("en-LK", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Entity: <span className="font-medium text-foreground">{log.entity_type}</span>
                          {log.user_name ? ` • by ${log.user_name}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Management Navigation */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-xs p-6">
            <h3 className="font-heading font-bold text-base text-foreground mb-4">Quick Management Hub</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "User Roles", href: "/admin/users", icon: Users },
                { label: "Website Info", href: "/admin/settings", icon: ShieldCheck },
                { label: "Testimonials", href: "/admin/testimonials", icon: Star },
                { label: "Audit Logs", href: "/admin/activity", icon: ActivityIcon },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-3.5 rounded-xl border border-border/70 bg-surface/30 hover:border-gold/40 hover:bg-gold/10 transition-all flex flex-col gap-2 group"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                    <span className="text-xs font-bold text-foreground group-hover:text-gold transition-colors">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
