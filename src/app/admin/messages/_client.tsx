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
  MailCheck,
  MailOpen,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Loader2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { markMessageRead, deleteMessage } from "@/actions/messages";
import type { ContactMessage } from "@/types";

interface Props {
  initialMessages: ContactMessage[];
  total: number;
}

export default function AdminMessagesClient({ initialMessages, total }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Message Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Delete Confirmation Modal
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openMessageModal = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    // If unread, mark as read automatically
    if (!msg.is_read) {
      try {
        const res = await markMessageRead(msg.id, true);
        if (res.success) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
          );
          setSelectedMessage((prev) => (prev && prev.id === msg.id ? { ...prev, is_read: true } : prev));
        }
      } catch {
        // Non-blocking
      }
    }
  };

  const handleToggleRead = async (msgId: string, currentIsRead: boolean) => {
    setLoadingId(msgId);
    try {
      const result = await markMessageRead(msgId, !currentIsRead);
      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, is_read: !currentIsRead } : msg
          )
        );
        if (selectedMessage?.id === msgId) {
          setSelectedMessage((prev) => (prev ? { ...prev, is_read: !currentIsRead } : null));
        }
        toast.success(currentIsRead ? "Marked as unread." : "Marked as read.");
      } else {
        toast.error(result.error ?? "Failed to update message status.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMessage) return;
    setIsDeleting(true);
    try {
      const result = await deleteMessage(deletingMessage.id);
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== deletingMessage.id));
        if (selectedMessage?.id === deletingMessage.id) {
          setSelectedMessage(null);
        }
        toast.success("Contact message deleted.");
        setDeletingMessage(null);
      } else {
        toast.error(result.error ?? "Failed to delete message.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      filterTab === "all" ||
      (filterTab === "unread" && !m.is_read) ||
      (filterTab === "read" && m.is_read);

    return matchesSearch && matchesTab;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const readCount = messages.filter((m) => m.is_read).length;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-dark">
            Contact Enquiries
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Review and respond to client inquiries sent through the website contact form.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sender, subject, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border/80 rounded-xl text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-surface border border-border/80 rounded-xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTab("all")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  filterTab === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                All ({messages.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTab("unread")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  filterTab === "unread" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterTab("read")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  filterTab === "read" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Read ({readCount})
              </Button>
            </div>
          </div>

          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            Showing {filteredMessages.length} inquiries
          </span>
        </div>

        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <div className="py-20 text-center px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-sm text-dark">No contact enquiries yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                {search || filterTab !== "all"
                  ? "No messages match your search filter."
                  : "When customers submit the contact form, their enquiries will appear here."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow>
                  <TableHead className="font-semibold text-dark font-heading">Sender Details</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Inquiry Subject</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Message Preview</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Status</TableHead>
                  <TableHead className="font-semibold text-dark font-heading">Received</TableHead>
                  <TableHead className="text-right font-semibold text-dark font-heading">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => (
                  <TableRow
                    key={msg.id}
                    className={`hover:bg-surface/20 transition-colors cursor-pointer ${
                      !msg.is_read ? "bg-gold-50/25 font-semibold" : ""
                    }`}
                    onClick={() => openMessageModal(msg)}
                  >
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col text-left">
                        <span className={`text-sm text-dark ${!msg.is_read ? "font-extrabold" : "font-semibold"}`}>
                          {msg.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{msg.email}</span>
                        {msg.phone && (
                          <span className="text-[11px] text-muted-foreground">{msg.phone}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-dark-800 font-bold max-w-xs">
                      {msg.subject}
                    </TableCell>

                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {msg.message}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          !msg.is_read
                            ? "bg-gold-50 text-gold border-gold/20"
                            : "bg-surface text-muted-foreground border-border"
                        }
                        variant="outline"
                      >
                        {!msg.is_read ? "UNREAD" : "READ"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openMessageModal(msg)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title="Open Full Message"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === msg.id}
                          onClick={() => handleToggleRead(msg.id, msg.is_read)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title={msg.is_read ? "Mark as Unread" : "Mark as Read"}
                        >
                          {msg.is_read ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <MailCheck className="h-4 w-4 text-gold" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === msg.id}
                          onClick={() => setDeletingMessage(msg)}
                          className="h-8 w-8 rounded-lg hover:border-error hover:text-error"
                          title="Delete Message"
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

      {/* Full Message View Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-xl bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden">
          <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light" />
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-heading font-bold text-lg text-foreground">
                Contact Inquiry Details
              </DialogTitle>
              {selectedMessage && (
                <Badge
                  variant="outline"
                  className={
                    selectedMessage.is_read
                      ? "bg-surface text-muted-foreground border-border"
                      : "bg-gold-50 text-gold border-gold/20"
                  }
                >
                  {selectedMessage.is_read ? "READ" : "UNREAD"}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedMessage && (
            <div className="px-6 py-5 space-y-5 text-xs">
              {/* Sender summary card */}
              <div className="p-4 rounded-xl bg-surface/50 border border-border/60 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-sm text-foreground block">{selectedMessage.name}</span>
                    <span className="text-muted-foreground font-mono">{selectedMessage.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold text-dark font-semibold hover:bg-gold-dark rounded-lg text-xs transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Reply Email</span>
                    </a>
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-card border border-border hover:border-gold rounded-lg text-xs font-semibold transition-colors text-foreground"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-4 text-muted-foreground text-[11px]">
                  {selectedMessage.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {selectedMessage.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedMessage.created_at).toLocaleString("en-AE")}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                  Subject Line
                </span>
                <p className="font-bold text-sm text-foreground">{selectedMessage.subject}</p>
              </div>

              {/* Full Message Body */}
              <div className="space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                  Message Content
                </span>
                <div className="p-4 rounded-xl bg-surface/50 border border-border/80 text-foreground leading-relaxed whitespace-pre-wrap font-sans text-xs">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.is_read)}
                  className="rounded-xl text-xs"
                >
                  {selectedMessage.is_read ? "Mark as Unread" : "Mark as Read"}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingMessage(selectedMessage)}
                    className="rounded-xl text-xs text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                    className="rounded-xl text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingMessage} onOpenChange={(open) => !open && setDeletingMessage(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Delete Contact Message
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to permanently delete the inquiry from{" "}
              <strong className="text-foreground">{deletingMessage?.name}</strong> regarding &quot;{deletingMessage?.subject}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingMessage(null)}
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
