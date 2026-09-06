"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Wallet, Plus, Search, Filter, FileText, CheckCircle, XCircle, Upload
} from "lucide-react";
import { expenseSchema, type ExpenseFormData } from "@/lib/validators";
import { createExpense, approveExpense, rejectExpense, createExpenseCategory } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { User, Expense, ExpenseCategory } from "@/types";

interface Props {
  user: User;
  initialExpenses: Expense[];
  categories: ExpenseCategory[];
}

export default function ExpenseTrackerClient({ user, initialExpenses, categories }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  // Expense Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category_id: "",
      amount: 0,
      currency: "AED",
      description: "",
      receipt_url: "",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  // Category Form
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryBudget, setCategoryBudget] = useState(1000);

  // File Upload Helper
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "receipts");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadedReceiptUrl(data.url);
        setValue("receipt_url", data.url);
        toast.success("Receipt uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload receipt.");
      }
    } catch {
      toast.error("Receipt upload encountered an error.");
    } finally {
      setIsUploading(false);
    }
  };

  const onAddExpenseSubmit = async (data: ExpenseFormData) => {
    startTransition(async () => {
      const res = await createExpense(data);
      if (res.success) {
        toast.success("Expense logged successfully!");
        setIsAddExpenseOpen(false);
        setUploadedReceiptUrl(null);
        reset();
        
        // Refresh local expenses
        window.location.reload();
      } else {
        toast.error("Failed to log expense.");
      }
    });
  };

  const onAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    startTransition(async () => {
      const res = await createCategoryAction();
      if (res.success) {
        toast.success("Category added successfully!");
        setIsAddCategoryOpen(false);
        setCategoryName("");
        setCategoryDesc("");
        setCategoryBudget(1000);
        window.location.reload();
      } else {
        toast.error(typeof res.error === "string" ? res.error : "Failed to add category.");
      }
    });
  };

  const createCategoryAction = async () => {
    return await createExpenseCategory({
      name: categoryName,
      description: categoryDesc,
      budget_limit: Number(categoryBudget),
      is_active: true
    });
  };

  const handleApprove = async (expenseId: string) => {
    startTransition(async () => {
      const res = await approveExpense(expenseId);
      if (res.success) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === expenseId ? { ...e, status: "approved" as const } : e))
        );
        toast.success("Expense approved.");
      } else {
        toast.error(res.error || "Failed to approve expense.");
      }
    });
  };

  const handleReject = async (expenseId: string) => {
    startTransition(async () => {
      const res = await rejectExpense(expenseId);
      if (res.success) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === expenseId ? { ...e, status: "rejected" as const } : e))
        );
        toast.success("Expense rejected.");
      } else {
        toast.error(res.error || "Failed to reject expense.");
      }
    });
  };

  // Filter and Search Logic Client-side for instant UX feedback
  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = filterCategory === "all" || e.category_id === filterCategory;
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    const matchesSearch =
      searchTerm.trim() === "" ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category_name && e.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.user_name && e.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="section-padding bg-surface min-h-[85vh] text-left">
      <div className="container-custom max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-heading text-foreground flex items-center gap-3">
              <Wallet className="h-8 w-8 text-gold" />
              Corporate Expense Tracker
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              {isAdmin 
                ? "Oversee company ledger outflows, review employee receipts, and execute audits." 
                : "Submit business expenses, upload tax invoices, and monitor approval cycles."
              }
            </p>
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" className="border-gold/30 hover:border-gold hover:bg-gold/10">
                      <span>Add Category</span>
                    </Button>
                  }
                />
                <DialogContent className="rounded-2xl max-w-md bg-card text-foreground border border-border/80">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Create Expense Category</DialogTitle>
                    <DialogDescription>Define corporate budget thresholds and names.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={onAddCategorySubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label htmlFor="catName" className="text-xs font-semibold">Category Name</Label>
                      <Input
                        id="catName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g. Subscriptions"
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="catDesc" className="text-xs font-semibold">Description</Label>
                      <Input
                        id="catDesc"
                        value={categoryDesc}
                        onChange={(e) => setCategoryDesc(e.target.value)}
                        placeholder="Detail the scope of this category"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="catBudget" className="text-xs font-semibold">Budget Limit (AED)</Label>
                      <Input
                        id="catBudget"
                        type="number"
                        value={categoryBudget}
                        onChange={(e) => setCategoryBudget(Number(e.target.value))}
                        className="rounded-xl"
                      />
                    </div>
                    <Button type="submit" disabled={isPending} className="w-full mt-2">
                      Save Category
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger
                render={
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Log Expense</span>
                  </Button>
                }
              />
              <DialogContent className="rounded-2xl max-w-lg bg-card text-foreground border border-border/80">
                <DialogHeader>
                  <DialogTitle className="font-heading">Log Business Expense</DialogTitle>
                  <DialogDescription>Submit transactions along with official VAT receipts.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onAddExpenseSubmit)} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <Label htmlFor="category" className="text-xs font-semibold">Expense Category</Label>
                      <select
                        id="category"
                        {...register("category_id")}
                        className="w-full bg-background text-foreground border border-input rounded-xl h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="text-error text-xs">{errors.category_id.message}</p>
                      )}
                    </div>
                    <div className="space-y-1 text-left">
                      <Label htmlFor="date" className="text-xs font-semibold">Transaction Date</Label>
                      <Input
                        id="date"
                        type="date"
                        {...register("transaction_date")}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1 text-left">
                      <Label htmlFor="amount" className="text-xs font-semibold">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("amount", { valueAsNumber: true })}
                        className="rounded-xl"
                      />
                      {errors.amount && (
                        <p className="text-error text-xs">{errors.amount.message}</p>
                      )}
                    </div>
                    <div className="space-y-1 text-left">
                      <Label htmlFor="currency" className="text-xs font-semibold">Currency</Label>
                      <Input
                        id="currency"
                        value="AED"
                        readOnly
                        {...register("currency")}
                        className="rounded-xl bg-surface/40 text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
                    <Input
                      id="desc"
                      placeholder="e.g. Office laptop accessories"
                      {...register("description")}
                      className="rounded-xl"
                    />
                    {errors.description && (
                      <p className="text-error text-xs">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-xs font-semibold">Invoice/Receipt Upload</Label>
                    <div className="border border-dashed border-border hover:border-gold/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-surface/20 transition-all relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {isUploading ? "Uploading file..." : "Click to select or drop image receipt"}
                      </span>
                    </div>
                    {uploadedReceiptUrl && (
                      <p className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Receipt linked successfully!
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={isPending} className="w-full mt-2">
                    Submit Outflow Log
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <Card className="border border-border/70 rounded-2xl bg-card shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search description, categories, or submitters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-surface/30 border-border/80 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Filter by:</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-surface/30 border-border/80 rounded-xl text-xs h-9 w-[140px] px-2 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface/30 border-border/80 rounded-xl text-xs h-9 w-[130px] px-2 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Ledger Table */}
        <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-surface/20 px-6 py-4">
            <CardTitle className="text-base font-heading font-bold text-foreground">Transaction Log Book</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredExpenses.length} expense entries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredExpenses.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No matching transactions recorded.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-surface/40">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground font-heading">Date</TableHead>
                    {isAdmin && (
                      <TableHead className="font-semibold text-foreground font-heading">Submitter</TableHead>
                    )}
                    <TableHead className="font-semibold text-foreground font-heading">Category</TableHead>
                    <TableHead className="font-semibold text-foreground font-heading">Description</TableHead>
                    <TableHead className="font-semibold text-foreground font-heading">Receipt</TableHead>
                    <TableHead className="font-semibold text-foreground font-heading">Amount</TableHead>
                    <TableHead className="font-semibold text-foreground font-heading">Status</TableHead>
                    {isAdmin && (
                      <TableHead className="text-right font-semibold text-foreground font-heading">Audit Approval</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((exp) => (
                    <TableRow key={exp.id} className="hover:bg-surface/10 transition-colors">
                      <TableCell className="text-xs font-medium text-foreground/80">
                        {new Date(exp.transaction_date).toLocaleDateString("en-AE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="font-medium text-xs text-foreground">{exp.user_name ?? "—"}</TableCell>
                      )}
                      <TableCell>
                        <Badge variant="outline" className="bg-surface/40 text-foreground border-border text-[10px] uppercase font-bold">
                          {exp.category_name ?? "General"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground/80 max-w-xs truncate">
                        {exp.description}
                      </TableCell>
                      <TableCell>
                        {exp.receipt_url ? (
                          <a
                            href={exp.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold font-semibold text-xs flex items-center gap-1 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Invoice</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-xs">
                        {exp.amount.toLocaleString("en-AE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {exp.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            exp.status === "approved"
                              ? "bg-green-50 text-green-600 border-green-200"
                              : exp.status === "rejected"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-gold-50 text-gold border-gold/20"
                          }
                          variant="outline"
                        >
                          {exp.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right py-3">
                          {exp.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleApprove(exp.id)}
                                className="h-7 border-green-200 text-green-600 hover:bg-green-50 flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Approve</span>
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleReject(exp.id)}
                                className="h-7 border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium">Audited</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
