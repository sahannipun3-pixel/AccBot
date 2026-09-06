"use client";

import { useState, useTransition } from "react";
import { 
  Building2, Plus, Calendar, FileText, CheckCircle, BarChart3, Scale, ListFilter, AlertCircle
} from "lucide-react";
import { createAccount, createLedgerTransaction } from "@/actions/ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { User, LedgerAccount, TrialBalanceRow } from "@/types";
import type { ProfitAndLossReport, BalanceSheetReport } from "@/actions/ledger";

interface Props {
  user: User;
  accounts: LedgerAccount[];
  trialBalance: TrialBalanceRow[];
  plReport: ProfitAndLossReport;
  bsReport: BalanceSheetReport;
}

export default function AccountsWebClient({ user, accounts, trialBalance, plReport, bsReport }: Props) {
  const [activeTab, setActiveTab] = useState("accounts");
  const [reportTab, setReportTab] = useState("trial-balance");
  const [isPending, startTransition] = useTransition();
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  // Account Form Dialog State
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accCode, setAccCode] = useState("");
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<"asset" | "liability" | "equity" | "revenue" | "expense">("asset");

  // Transaction Form States
  const [refNum, setRefNum] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [journalLines, setJournalLines] = useState<{ account_id: string; debit: number; credit: number; description: string }[]>([
    { account_id: "", debit: 0, credit: 0, description: "" },
    { account_id: "", debit: 0, credit: 0, description: "" }
  ]);

  const totalDebit = journalLines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = journalLines.reduce((sum, line) => sum + line.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    setJournalLines((prev) => [...prev, { account_id: "", debit: 0, credit: 0, description: "" }]);
  };

  const handleRemoveLine = (index: number) => {
    setJournalLines((prev) => prev.filter((_, idx) => idx !== index));
  };

interface JournalLine {
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

  const handleLineChange = (index: number, key: keyof JournalLine, value: string | number) => {
    setJournalLines((prev) =>
      prev.map((line, idx) => {
        if (idx === index) {
          const numVal = typeof value === "number" ? value : parseFloat(value as string) || 0;
          if (key === "debit") {
            return { ...line, debit: numVal, credit: numVal > 0 ? 0 : line.credit };
          }
          if (key === "credit") {
            return { ...line, credit: numVal, debit: numVal > 0 ? 0 : line.debit };
          }
          if (key === "account_id" || key === "description") {
            return { ...line, [key]: String(value) };
          }
          return line;
        }
        return line;
      })
    );
  };

  const onAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accCode || !accName) return;

    startTransition(async () => {
      const res = await createAccount({
        code: accCode,
        name: accName,
        type: accType,
        currency: "AED",
        is_active: true
      });

      if (res.success) {
        toast.success("Ledger Account created successfully!");
        setIsAddAccountOpen(false);
        setAccCode("");
        setAccName("");
        window.location.reload();
      } else {
        toast.error(typeof res.error === "object" ? "Validation failed." : res.error);
      }
    });
  };

  const onPostTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check fields
    if (!refNum || !txDesc || journalLines.some(l => !l.account_id)) {
      toast.error("Please complete all transaction header and account line fields.");
      return;
    }

    if (!isBalanced) {
      toast.error("Unbalanced transaction: Debits must equal Credits.");
      return;
    }

    startTransition(async () => {
      const payload = {
        reference_number: refNum,
        description: txDesc,
        transaction_date: txDate,
        entries: journalLines.map(line => ({
          account_id: line.account_id,
          debit: Number(line.debit),
          credit: Number(line.credit),
          description: line.description || null
        }))
      };

      const res = await createLedgerTransaction(payload);
      if (res.success) {
        toast.success("Journal transaction posted successfully!");
        setRefNum("");
        setTxDesc("");
        setJournalLines([
          { account_id: "", debit: 0, credit: 0, description: "" },
          { account_id: "", debit: 0, credit: 0, description: "" }
        ]);
        window.location.reload();
      } else {
        toast.error("Failed to post journal entries.");
      }
    });
  };

  return (
    <div className="section-padding bg-surface min-h-[85vh] text-left">
      <div className="container-custom max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-heading text-dark flex items-center gap-3">
              <Scale className="h-8 w-8 text-gold" />
              Double-Entry Ledger Portal
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Inspect UAE corporate ledger nodes, post balanced journal splits, and compile real-time financial statements.
            </p>
          </div>

          {isAdmin && (
            <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
              <DialogTrigger
                render={
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Account</span>
                  </Button>
                }
              />
              <DialogContent className="rounded-2xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Create Ledger Account</DialogTitle>
                  <DialogDescription>Define code identifiers and financial node categories.</DialogDescription>
                </DialogHeader>
                <form onSubmit={onAddAccountSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="code" className="text-xs font-semibold">Account Code</Label>
                    <Input
                      id="code"
                      value={accCode}
                      onChange={(e) => setAccCode(e.target.value)}
                      placeholder="e.g. 1010"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-semibold">Account Name</Label>
                    <Input
                      id="name"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                      placeholder="e.g. Petty Cash"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="type" className="text-xs font-semibold">Account Type</Label>
                    <select
                      id="type"
                      value={accType}
                      onChange={(e) => setAccType(e.target.value as "asset" | "liability" | "equity" | "revenue" | "expense")}
                      className="w-full bg-background text-foreground border border-input rounded-xl h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="asset">Asset (Balance Sheet)</option>
                      <option value="liability">Liability (Balance Sheet)</option>
                      <option value="equity">Equity (Balance Sheet)</option>
                      <option value="revenue">Revenue (Income Statement)</option>
                      <option value="expense">Expense (Income Statement)</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full mt-2">
                    Save Account
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-surface/50 border border-border/80 p-1 rounded-2xl flex justify-start gap-1 w-full max-w-md h-auto">
            <TabsTrigger value="accounts" className="rounded-xl py-2 w-full text-xs font-semibold">
              Chart of Accounts
            </TabsTrigger>
            <TabsTrigger value="transaction" className="rounded-xl py-2 w-full text-xs font-semibold">
              Journal Posting
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl py-2 w-full text-xs font-semibold">
              Financial Reports
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Chart of Accounts */}
          <TabsContent value="accounts" className="space-y-6 outline-none">
            <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-surface/20 px-6 py-4">
                <CardTitle className="text-base font-heading font-bold text-foreground font-heading">Financial Node Structure</CardTitle>
                <CardDescription className="text-xs">Active accounts recorded on the corporate catalog.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-surface/40">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground font-heading">Account Code</TableHead>
                      <TableHead className="font-semibold text-foreground font-heading">Account Title</TableHead>
                      <TableHead className="font-semibold text-foreground font-heading">Category Group</TableHead>
                      <TableHead className="font-semibold text-foreground font-heading">Currency</TableHead>
                      <TableHead className="font-semibold text-foreground font-heading">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((acc) => (
                      <TableRow key={acc.id} className="hover:bg-surface/10 transition-colors">
                        <TableCell className="font-bold text-foreground text-xs">{acc.code}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground/90">{acc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-surface text-foreground border-border text-[10px] uppercase font-bold">
                            {acc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">{acc.currency}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                            ACTIVE
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Journal Posting Form */}
          <TabsContent value="transaction" className="outline-none">
            <Card className="border border-border/80 bg-card rounded-2xl shadow-sm">
              <CardHeader className="border-b border-border/60 bg-surface/20 px-6 py-4">
                <CardTitle className="text-base font-heading font-bold text-foreground">Post Balanced Journal Splits</CardTitle>
                <CardDescription className="text-xs">
                  Create double-entry records. The ledger enforces that Debits = Credits.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={onPostTransactionSubmit} className="space-y-6">
                  {/* Header Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <Label htmlFor="ref" className="text-xs font-semibold">Reference / Invoice Number</Label>
                      <Input
                        id="ref"
                        value={refNum}
                        onChange={(e) => setRefNum(e.target.value)}
                        placeholder="e.g. INV-2026-001"
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="txdate" className="text-xs font-semibold">Posting Date</Label>
                      <Input
                        id="txdate"
                        type="date"
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="txdesc" className="text-xs font-semibold">Transaction Overview</Label>
                      <Input
                        id="txdesc"
                        value={txDesc}
                        onChange={(e) => setTxDesc(e.target.value)}
                        placeholder="e.g. Retainer fees collection"
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Splits Row */}
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <h3 className="font-heading font-bold text-sm text-foreground">Split Entries</h3>
                    <div className="space-y-3">
                      {journalLines.map((line, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-surface/10 p-3 rounded-xl border border-border/40">
                          <div className="w-full md:w-1/3 space-y-1 text-left">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Account</Label>
                            <select
                              value={line.account_id}
                              onChange={(e) => handleLineChange(index, "account_id", e.target.value)}
                              className="w-full bg-background text-foreground border border-input rounded-xl text-xs h-9 px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="">Choose account...</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.code} — {a.name} ({a.type})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="w-full md:w-1/4 space-y-1 text-left">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Debit (AED)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.debit || ""}
                              onChange={(e) => handleLineChange(index, "debit", Number(e.target.value))}
                              placeholder="0.00"
                              className="rounded-xl text-xs h-9"
                            />
                          </div>

                          <div className="w-full md:w-1/4 space-y-1 text-left">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Credit (AED)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.credit || ""}
                              onChange={(e) => handleLineChange(index, "credit", Number(e.target.value))}
                              placeholder="0.00"
                              className="rounded-xl text-xs h-9"
                            />
                          </div>

                          <div className="w-full md:w-1/3 space-y-1 text-left">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Line Description</Label>
                            <Input
                              value={line.description}
                              onChange={(e) => handleLineChange(index, "description", e.target.value)}
                              placeholder="Specific line detail"
                              className="rounded-xl text-xs h-9"
                            />
                          </div>

                          {journalLines.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveLine(index)}
                              className="h-9 px-3 border-red-200 text-red-500 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button type="button" variant="outline" onClick={handleAddLine} className="text-xs">
                      + Add Entry Line
                    </Button>
                  </div>

                  {/* Summary Indicator */}
                  <div className="flex flex-col md:flex-row justify-between items-center bg-surface/30 p-4 rounded-xl border border-border/80 mt-4 gap-4">
                    <div className="flex gap-6 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground font-semibold">Total Debits:</span>{" "}
                        <span className="font-bold text-dark">{totalDebit.toFixed(2)} AED</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Total Credits:</span>{" "}
                        <span className="font-bold text-dark">{totalCredit.toFixed(2)} AED</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isBalanced ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" /> Balanced Statement
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" /> Unbalanced Entry
                        </span>
                      )}

                      <Button type="submit" disabled={isPending || !isBalanced} className="shadow-md">
                        Post Journal Entry
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Financial Reports */}
          <TabsContent value="reports" className="space-y-6 outline-none">
            <div className="flex gap-2 p-1 border border-border/80 bg-surface/30 rounded-xl w-full max-w-sm">
              <button
                onClick={() => setReportTab("trial-balance")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold w-full transition-all ${
                  reportTab === "trial-balance" ? "bg-card text-gold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Trial Balance
              </button>
              <button
                onClick={() => setReportTab("p-and-l")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold w-full transition-all ${
                  reportTab === "p-and-l" ? "bg-card text-gold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Profit &amp; Loss
              </button>
              <button
                onClick={() => setReportTab("balance-sheet")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold w-full transition-all ${
                  reportTab === "balance-sheet" ? "bg-card text-gold shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Balance Sheet
              </button>
            </div>

            {/* Sub-Tab 1: Trial Balance */}
            {reportTab === "trial-balance" && (
              <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-surface/20 px-6 py-4">
                  <CardTitle className="text-base font-heading font-bold text-foreground flex items-center gap-2">
                    <Scale className="h-5 w-5 text-gold" />
                    Trial Balance Report
                  </CardTitle>
                  <CardDescription className="text-xs">Audit values across accounts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-surface/40">
                      <TableRow>
                        <TableHead className="font-semibold text-foreground font-heading">Code</TableHead>
                        <TableHead className="font-semibold text-foreground font-heading">Account</TableHead>
                        <TableHead className="font-semibold text-foreground font-heading">Type</TableHead>
                        <TableHead className="font-semibold text-foreground font-heading text-right">Debit Summary (AED)</TableHead>
                        <TableHead className="font-semibold text-foreground font-heading text-right">Credit Summary (AED)</TableHead>
                        <TableHead className="font-semibold text-foreground font-heading text-right">Net Balance (AED)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalance.map((row) => (
                        <TableRow key={row.account_id} className="hover:bg-surface/10 transition-colors">
                          <TableCell className="font-bold text-xs">{row.code}</TableCell>
                          <TableCell className="text-xs font-semibold text-foreground/90">{row.name}</TableCell>
                          <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{row.type}</TableCell>
                          <TableCell className="text-right text-xs font-medium text-foreground/90">{row.total_debit.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-xs font-medium text-foreground/90">{row.total_credit.toFixed(2)}</TableCell>
                          <TableCell className={`text-right text-xs font-bold ${row.net_balance < 0 ? "text-red-500" : "text-foreground"}`}>
                            {row.net_balance.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Sub-Tab 2: Profit & Loss Statement */}
            {reportTab === "p-and-l" && (
              <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-surface/20 px-6 py-4">
                  <CardTitle className="text-base font-heading font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gold" />
                    Profit &amp; Loss Statement (Income Statement)
                  </CardTitle>
                  <CardDescription className="text-xs">Summary of business revenues and expenses.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Revenues */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Operating Revenues</h3>
                    {plReport.revenues.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No operating revenues recorded.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {plReport.revenues.map((r) => (
                          <div key={r.code} className="flex justify-between text-xs font-medium text-foreground/90">
                            <span>{r.code} — {r.name}</span>
                            <span>{r.balance.toFixed(2)} AED</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold text-foreground pt-2 border-t border-dashed border-border/80">
                          <span>Total Revenues</span>
                          <span>{plReport.totalRevenues.toFixed(2)} AED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expenses */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Operating Expenses</h3>
                    {plReport.expenses.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No operating expenses recorded.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {plReport.expenses.map((e) => (
                          <div key={e.code} className="flex justify-between text-xs font-medium text-foreground/90">
                            <span>{e.code} — {e.name}</span>
                            <span>{e.balance.toFixed(2)} AED</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold text-foreground pt-2 border-t border-dashed border-border/80">
                          <span>Total Expenses</span>
                          <span>{plReport.totalExpenses.toFixed(2)} AED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Net Summary */}
                  <div className="flex justify-between items-center bg-surface/30 p-4 rounded-xl border border-border mt-4">
                    <span className="text-sm font-bold text-foreground font-heading">Net Profit / Loss</span>
                    <span className={`text-base font-extrabold font-heading ${plReport.netProfitLoss < 0 ? "text-red-500" : "text-green-600"}`}>
                      {plReport.netProfitLoss.toFixed(2)} AED
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sub-Tab 3: Balance Sheet */}
            {reportTab === "balance-sheet" && (
              <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-surface/20 px-6 py-4">
                  <CardTitle className="text-base font-heading font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gold" />
                    Balance Sheet Report
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Assets must match Liabilities + Shareholders Equity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Assets */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Assets</h3>
                    {bsReport.assets.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No asset balances.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {bsReport.assets.map((a) => (
                          <div key={a.code} className="flex justify-between text-xs font-medium text-foreground/90">
                            <span>{a.code} — {a.name}</span>
                            <span>{a.balance.toFixed(2)} AED</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold text-foreground pt-2 border-t border-dashed border-border/80">
                          <span>Total Assets</span>
                          <span>{bsReport.totalAssets.toFixed(2)} AED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Liabilities */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Liabilities</h3>
                    {bsReport.liabilities.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No liability balances.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {bsReport.liabilities.map((l) => (
                          <div key={l.code} className="flex justify-between text-xs font-medium text-foreground/90">
                            <span>{l.code} — {l.name}</span>
                            <span>{l.balance.toFixed(2)} AED</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-bold text-foreground pt-2 border-t border-dashed border-border/80">
                          <span>Total Liabilities</span>
                          <span>{bsReport.totalLiabilities.toFixed(2)} AED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Equity */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-1">Shareholders Equity</h3>
                    <div className="space-y-1.5">
                      {bsReport.equity.map((eq) => (
                        <div key={eq.code} className="flex justify-between text-xs font-medium text-foreground/90">
                          <span>{eq.code} — {eq.name}</span>
                          <span>{eq.balance.toFixed(2)} AED</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-medium text-foreground/90">
                        <span>Retained Earnings (Dynamic Net Income)</span>
                        <span>{bsReport.netIncomeRetained.toFixed(2)} AED</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-dark pt-2 border-t border-dashed border-border/80">
                        <span>Total Equity</span>
                        <span>{bsReport.totalEquity.toFixed(2)} AED</span>
                      </div>
                    </div>
                  </div>

                  {/* Accounting equation check */}
                  <div className="grid grid-cols-2 gap-4 bg-surface/30 p-4 rounded-xl border border-border mt-4">
                    <div className="text-left">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Total Assets</span>
                      <h4 className="text-lg font-extrabold font-heading text-dark mt-0.5">
                        {bsReport.totalAssets.toFixed(2)} AED
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Total Liabilities + Equity</span>
                      <h4 className="text-lg font-extrabold font-heading text-dark mt-0.5">
                        {(bsReport.totalLiabilities + bsReport.totalEquity).toFixed(2)} AED
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
