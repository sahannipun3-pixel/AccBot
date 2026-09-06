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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Activity,
  Eye,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  Code,
  RotateCcw,
  Filter,
} from "lucide-react";
import type { ActivityLog } from "@/types";

interface Props {
  initialLogs: ActivityLog[];
  total: number;
}

const ENTITY_OPTIONS = [
  { label: "All Entities", value: "all" },
  { label: "Users", value: "user" },
  { label: "Services", value: "service" },
  { label: "Contact Inquiries", value: "contact_message" },
  { label: "Blog Posts", value: "blog_post" },
  { label: "Team Members", value: "team_member" },
  { label: "Testimonials", value: "testimonial" },
  { label: "Website Settings", value: "website_setting" },
  { label: "Expenses", value: "expense" },
];

export default function AdminActivityClient({ initialLogs, total }: Props) {
  const [logs] = useState<ActivityLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.user_name && log.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.user_email && log.user_email.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toUpperCase();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("delete")) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    if (action.includes("create")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (action.includes("update") || action.includes("toggle"))
      return "bg-gold/15 text-gold border-gold/30";
    return "bg-surface text-foreground border-border";
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Activity Audit Trail
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Tamper-evident logs of administrative operations, content updates, and access events.
          </p>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search action, user, entity ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/80 rounded-xl text-xs"
              />
            </div>

            {/* Entity Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="h-9 rounded-xl border border-border/80 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {ENTITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            Showing {filteredLogs.length} events
          </span>
        </div>

        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-sm text-foreground">No matching activity records</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                Administrative events such as service updates, status changes, and role assignments will be recorded here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground font-heading">Action Performed</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Entity Type</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Actor / Administrator</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Timestamp</TableHead>
                  <TableHead className="text-right font-semibold text-foreground font-heading">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-surface/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold tracking-wider ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {formatAction(log.action)}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-foreground font-mono">
                      {log.entity_type}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-xs text-foreground">
                          {log.user_name || "System Automated"}
                        </span>
                        {log.user_email && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {log.user_email}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-LK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                        title="View Full Metadata"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Metadata Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-4 border-b border-border/60">
            <DialogTitle className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <span>Audit Log Record Details</span>
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface/50">
                <div>
                  <span className="text-muted-foreground block text-[11px] font-bold">ACTION</span>
                  <span className="font-bold text-foreground">{formatAction(selectedLog.action)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-bold">ENTITY</span>
                  <span className="font-mono text-foreground">{selectedLog.entity_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-bold">PERFORMED BY</span>
                  <span className="text-foreground font-medium">{selectedLog.user_name || "System"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] font-bold">TIMESTAMP</span>
                  <span className="text-foreground">{new Date(selectedLog.created_at).toLocaleString("en-LK")}</span>
                </div>
              </div>

              {selectedLog.entity_id && (
                <div className="space-y-1">
                  <span className="font-bold text-muted-foreground text-[10px] uppercase">
                    Target Entity ID
                  </span>
                  <p className="font-mono text-xs text-foreground p-2 bg-surface rounded-lg border border-border">
                    {selectedLog.entity_id}
                  </p>
                </div>
              )}

              {/* Formatted JSON Metadata */}
              <div className="space-y-1.5">
                <span className="font-bold text-muted-foreground text-[10px] uppercase flex items-center gap-1">
                  <Code className="h-3.5 w-3.5 text-gold" />
                  <span>Recorded Event Metadata</span>
                </span>
                <pre className="p-3 bg-dark-900 text-gray-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-border">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedLog(null)} className="rounded-xl">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
