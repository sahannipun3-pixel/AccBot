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
  ToggleLeft,
  ToggleRight,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Briefcase,
  Layers,
  HelpCircle,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  toggleServiceVisibility,
  createService,
  updateService,
  deleteService,
} from "@/actions/services";
import type { Service, ProcessStep, ServiceFAQ } from "@/types";

interface Props {
  initialServices: Service[];
}

const AVAILABLE_ICONS = [
  "Building2",
  "ClipboardCheck",
  "BookOpen",
  "Calculator",
  "Wallet",
  "FileText",
  "LineChart",
  "Briefcase",
];

export default function AdminServicesClient({ initialServices }: Props) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("FileText");
  const [shortDescription, setShortDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Sub-lists
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [faqs, setFaqs] = useState<ServiceFAQ[]>([]);

  // Delete Modal state
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (formMode === "create") {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(generated);
    }
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setEditingId(null);
    setTitle("");
    setSlug("");
    setIcon("FileText");
    setShortDescription("");
    setOverview("");
    setSortOrder(services.length);
    setIsActive(true);
    setBenefits([]);
    setNewBenefitInput("");
    setProcessSteps([
      { step: 1, title: "Initial Assessment", description: "Reviewing requirements & documentation." },
      { step: 2, title: "Execution & Audit", description: "Delivering core accounting analysis." },
      { step: 3, title: "Compliance & Filing", description: "Submission to regulatory bodies." },
    ]);
    setFaqs([
      { question: "What documents are required for this service?", answer: "Valid trade license, bank statements, and relevant invoices." },
    ]);
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setFormMode("edit");
    setEditingId(service.id);
    setTitle(service.title);
    setSlug(service.slug);
    setIcon(service.icon);
    setShortDescription(service.short_description);
    setOverview(service.overview);
    setSortOrder(service.sort_order);
    setIsActive(service.is_active);
    setBenefits(service.benefits || []);
    setNewBenefitInput("");
    setProcessSteps(service.process_steps || []);
    setFaqs(service.faqs || []);
    setDialogOpen(true);
  };

  const addBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setBenefits((prev) => [...prev, newBenefitInput.trim()]);
    setNewBenefitInput("");
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const addProcessStep = () => {
    const nextStepNum = processSteps.length + 1;
    setProcessSteps((prev) => [
      ...prev,
      { step: nextStepNum, title: `Step ${nextStepNum}`, description: "Step description..." },
    ]);
  };

  const updateProcessStep = (index: number, field: "title" | "description", val: string) => {
    setProcessSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: val } : step))
    );
  };

  const removeProcessStep = (index: number) => {
    setProcessSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step: i + 1 }))
    );
  };

  const addFAQ = () => {
    setFaqs((prev) => [...prev, { question: "Frequently asked question?", answer: "Answer details..." }]);
  };

  const updateFAQ = (index: number, field: "question" | "answer", val: string) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: val } : faq))
    );
  };

  const removeFAQ = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !shortDescription.trim() || !overview.trim()) {
      toast.error("Please fill in all required service fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        icon,
        short_description: shortDescription.trim(),
        overview: overview.trim(),
        benefits,
        process_steps: processSteps,
        faqs,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (formMode === "create") {
        const res = await createService(payload);
        if (res.success) {
          toast.success("Service created successfully!");
          setServices((prev) => [
            ...prev,
            {
              id: res.id!,
              ...payload,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          setDialogOpen(false);
        } else {
          toast.error(res.error ?? "Failed to create service.");
        }
      } else if (editingId) {
        const res = await updateService(editingId, payload);
        if (res.success) {
          toast.success("Service updated successfully!");
          setServices((prev) =>
            prev.map((s) =>
              s.id === editingId
                ? { ...s, ...payload, updated_at: new Date().toISOString() }
                : s
            )
          );
          setDialogOpen(false);
        } else {
          toast.error(res.error ?? "Failed to update service.");
        }
      }
    } catch {
      toast.error("Unexpected error saving service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (serviceId: string) => {
    setLoadingId(serviceId);
    try {
      const res = await toggleServiceVisibility(serviceId);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId ? { ...s, is_active: res.is_active ?? !s.is_active } : s
          )
        );
        toast.success(res.is_active ? "Service published on website." : "Service hidden from website.");
      } else {
        toast.error(res.error ?? "Failed to update visibility.");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      const res = await deleteService(deletingService.id);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
        toast.success("Service deleted successfully.");
        setDeletingService(null);
      } else {
        toast.error(res.error ?? "Failed to delete service.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      s.short_description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.is_active) ||
      (statusFilter === "hidden" && !s.is_active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Services Management &amp; CMS
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Publish, edit, and structure the advisory offerings displayed across the public website.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          <span>New Service</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 bg-card rounded-2xl shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search service title, slug..."
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
                All ({services.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  statusFilter === "active" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Active ({services.filter((s) => s.is_active).length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter("hidden")}
                className={`rounded-lg text-xs font-semibold px-3 py-1.5 h-auto ${
                  statusFilter === "hidden" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Hidden ({services.filter((s) => !s.is_active).length})
              </Button>
            </div>
          </div>

          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            {services.filter((s) => s.is_active).length} of {services.length} active
          </span>
        </div>

        <CardContent className="p-0">
          {filteredServices.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-sm text-foreground">No services configured yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                Click &quot;New Service&quot; above to create and publish accounting offerings.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground font-heading">Service</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Slug / URL</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Summary</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Status</TableHead>
                  <TableHead className="font-semibold text-foreground font-heading">Order</TableHead>
                  <TableHead className="text-right font-semibold text-foreground font-heading">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-surface/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold shrink-0">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{service.title}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {service.benefits?.length || 0} benefits • {service.process_steps?.length || 0} steps • {service.faqs?.length || 0} FAQs
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      /services/{service.slug}
                    </TableCell>

                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {service.short_description}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          service.is_active
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }
                        variant="outline"
                      >
                        {service.is_active ? "PUBLISHED" : "HIDDEN"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      #{service.sort_order}
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openEditDialog(service)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title="Edit Service"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === service.id}
                          onClick={() => handleToggleVisibility(service.id)}
                          className="h-8 w-8 rounded-lg hover:border-gold hover:text-gold"
                          title={service.is_active ? "Hide Service" : "Publish Service"}
                        >
                          {service.is_active ? (
                            <ToggleRight className="h-4 w-4 text-success" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={loadingId === service.id}
                          onClick={() => setDeletingService(service)}
                          className="h-8 w-8 rounded-lg hover:border-error hover:text-error"
                          title="Delete Service"
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

      {/* Create / Edit Service Modal (Comprehensive CMS) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          <div className="p-1 h-1.5 bg-gradient-to-r from-gold to-gold-light sticky top-0 z-10" />
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border/60">
            <DialogTitle className="font-heading font-bold text-xl text-foreground">
              {formMode === "create" ? "Create New Service" : "Edit Service Details"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the service overview, key benefits, execution process steps, and FAQs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            {/* Primary Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Service Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Corporate Tax Advisory"
                  required
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">URL Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. corporate-tax-advisory"
                  required
                  className="bg-surface/50 border-border/80 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Icon Identifier</Label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border/80 bg-surface/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
                >
                  {AVAILABLE_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Sort Priority Order</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Short Summary * <span className="text-muted-foreground font-normal">(displayed on cards)</span>
              </Label>
              <Textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                placeholder="Brief value proposition..."
                required
                className="bg-surface/50 border-border/80 rounded-xl resize-none text-xs leading-relaxed"
              />
            </div>

            {/* Full Overview */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Detailed Overview * <span className="text-muted-foreground font-normal">(displayed on detail page)</span>
              </Label>
              <Textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows={4}
                placeholder="Full scope of service, deliverables, regulatory compliance details..."
                required
                className="bg-surface/50 border-border/80 rounded-xl resize-none text-xs leading-relaxed"
              />
            </div>

            {/* ── Key Benefits List Editor ── */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4 text-gold" />
                  <span>Key Benefits ({benefits.length})</span>
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                  placeholder="Type a key benefit and click Add..."
                  className="bg-surface/50 border-border/80 rounded-xl text-xs"
                />
                <Button type="button" size="sm" onClick={addBenefit} className="rounded-xl text-xs shrink-0">
                  Add Benefit
                </Button>
              </div>

              {benefits.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface/40 border border-border/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span className="text-foreground">{b}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-error rounded-md"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Process Steps Editor ── */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-gold" />
                  <span>Execution Process Steps ({processSteps.length})</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProcessStep}
                  className="rounded-xl text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Step
                </Button>
              </div>

              {processSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface/30 border border-border/70 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gold uppercase">Step {step.step}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcessStep(idx)}
                      className="h-6 w-6 text-muted-foreground hover:text-error"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={step.title}
                    onChange={(e) => updateProcessStep(idx, "title", e.target.value)}
                    placeholder="Step Title"
                    className="bg-card border-border/80 rounded-lg text-xs"
                  />
                  <Textarea
                    value={step.description}
                    onChange={(e) => updateProcessStep(idx, "description", e.target.value)}
                    placeholder="Step execution details..."
                    rows={2}
                    className="bg-card border-border/80 rounded-lg text-xs resize-none"
                  />
                </div>
              ))}
            </div>

            {/* ── FAQs Editor ── */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-gold" />
                  <span>Frequently Asked Questions ({faqs.length})</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFAQ}
                  className="rounded-xl text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add FAQ
                </Button>
              </div>

              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface/30 border border-border/70 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground">FAQ #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFAQ(idx)}
                      className="h-6 w-6 text-muted-foreground hover:text-error"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFAQ(idx, "question", e.target.value)}
                    placeholder="Question"
                    className="bg-card border-border/80 rounded-lg text-xs"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFAQ(idx, "answer", e.target.value)}
                    placeholder="Answer details..."
                    rows={2}
                    className="bg-card border-border/80 rounded-lg text-xs resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-2.5 pt-4 border-t border-border/60">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <Label htmlFor="is_active" className="text-xs font-semibold text-foreground cursor-pointer">
                Publish service immediately (visible on public services pages)
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
                {formMode === "create" ? "Create Service" : "Save Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
        <DialogContent className="max-w-md bg-card text-foreground rounded-2xl border border-border/80 shadow-2xl p-6">
          <DialogHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="font-heading font-bold text-lg text-foreground">
              Delete Service
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">&quot;{deletingService?.title}&quot;</strong>? This will remove the service from all public listing pages.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingService(null)}
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
              <span>Delete Service</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
