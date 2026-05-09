import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { LoanApplication, LoanAttachment, UploadedFile, useSolarUser, solarStore } from "@/lib/solarAuth";

const TENURES = [6, 12, 24, 36, 48, 60];

type DraftAttachment = {
  id: string;
  label: string;
  description: string;
  file?: UploadedFile;
  uploading?: boolean;
};

const statusBadgeVariant = (status: LoanApplication["status"]) => {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const statusTimelineLabels: Record<LoanApplication["status"], string> = {
  submitted: "Application submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const SolarLoan = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "apply">("list");
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  const [f, setF] = useState({
    applicantName: user.fullName,
    email: user.email,
    phone: "",
    capacityKw: "",
    amount: "",
    tenureMonths: "12",
    collateral: "",
    bank: "",
    monthlyIncome: "",
    purpose: "",
  });
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const latestLoan = useMemo(() => loans[0] ?? null, [loans]);

  const loadLoans = async () => {
    try {
      setLoadingLoans(true);
      const items = await solarStore.myLoans(user.id);
      setLoans(items);
    } catch {
      setLoans([]);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [user.id]);

  const addAttachmentRow = () => {
    setAttachments((prev) => [...prev, { id: crypto.randomUUID(), label: "", description: "" }]);
  };

  const removeAttachmentRow = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const updateAttachmentRow = (id: string, patch: Partial<DraftAttachment>) => {
    setAttachments((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const uploadAttachmentFile = (id: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit.");
      e.target.value = "";
      return;
    }
    try {
      updateAttachmentRow(id, { uploading: true });
      const uploaded = await solarStore.uploadFile(file);
      updateAttachmentRow(id, { file: uploaded, uploading: false });
      toast.success("Attachment uploaded.");
    } catch (error: any) {
      updateAttachmentRow(id, { uploading: false });
      toast.error(error?.message || "Attachment upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["applicantName", "email", "phone", "capacityKw", "amount", "collateral", "bank", "monthlyIncome", "purpose"] as const;
    for (const k of required) {
      if (!String(f[k]).trim()) {
        toast.error("Please fill all required fields.");
        return;
      }
    }

    const hasIncompleteAttachment =
      attachments.find((item) => item.label.trim() || item.description.trim() || item.file) &&
      attachments.some((item) => (item.label.trim() || item.description.trim() || item.file) && (!item.label.trim() || !item.file));
    if (hasIncompleteAttachment) {
      toast.error("Each attachment must have a label and file.");
      return;
    }

    const payloadAttachments: LoanAttachment[] = attachments
      .filter((item) => item.label.trim() && item.file)
      .map((item) => ({
        label: item.label.trim(),
        description: item.description.trim() || null,
        file: item.file as UploadedFile,
      }));

    try {
      setSubmitting(true);
      await solarStore.submitLoan({
        userId: user.id,
        applicantName: f.applicantName,
        email: f.email,
        phone: f.phone,
        capacityKw: Number(f.capacityKw),
        amount: Number(f.amount),
        tenureMonths: Number(f.tenureMonths),
        collateral: f.collateral,
        bank: f.bank,
        monthlyIncome: Number(f.monthlyIncome),
        purpose: f.purpose,
        attachments: payloadAttachments,
      });
      toast.success("Loan application submitted.");
      await loadLoans();
      setView("list");
      navigate("/subsidiaries/solar/loan");
    } catch (error: any) {
      toast.error(error?.message || "Loan submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="eyebrow text-primary mb-1">Solar Financing</p>
              <h1 className="text-3xl md:text-4xl font-bold">Solar Loan</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>
              View Application Progress
            </Button>
            <Button variant={view === "apply" ? "default" : "outline"} onClick={() => setView("apply")}>
              Apply for Loan
            </Button>
          </div>
        </div>

        {view === "list" ? (
          <div className="space-y-4">
            {latestLoan ? (
              <div className="border border-border bg-surface p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Latest Application</p>
                  <p className="text-xs text-muted-foreground">
                    NGN {latestLoan.amount.toLocaleString()} - {latestLoan.capacityKw} kW - {latestLoan.tenureMonths} months
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(latestLoan.status)}>{latestLoan.status.replace("_", " ")}</Badge>
              </div>
            ) : null}

            <div className="border border-border bg-surface">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Loan Applications</p>
              </div>
              {loadingLoans ? (
                <div className="p-6 text-sm text-muted-foreground">Loading applications...</div>
              ) : loans.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No loan application yet. Click "Apply for Loan" to start.</div>
              ) : (
                <div className="divide-y divide-border">
                  {loans.map((loan) => (
                    <button
                      key={loan.id}
                      type="button"
                      onClick={() => setSelectedLoan(loan)}
                      className="w-full px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold">NGN {loan.amount.toLocaleString()} - {loan.capacityKw} kW</p>
                        <p className="text-xs text-muted-foreground">{new Date(loan.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(loan.status)}>{loan.status.replace("_", " ")}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-surface border border-border p-6 md:p-8 shadow-card space-y-7">
            <Section title="Applicant">
              <Field label="Full Name"><Input value={f.applicantName} onChange={(e) => setF((s) => ({ ...s, applicantName: e.target.value }))} className="h-11" /></Field>
              <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))} className="h-11" /></Field>
              <Field label="Phone"><Input value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))} placeholder="+234..." className="h-11" /></Field>
              <Field label="Monthly Income (NGN)"><Input type="number" min="0" value={f.monthlyIncome} onChange={(e) => setF((s) => ({ ...s, monthlyIncome: e.target.value }))} className="h-11" /></Field>
            </Section>

            <Section title="Solar System">
              <Field label="Capacity (kW)"><Input type="number" min="0" step="0.1" value={f.capacityKw} onChange={(e) => setF((s) => ({ ...s, capacityKw: e.target.value }))} className="h-11" /></Field>
              <Field label="Loan Amount (NGN)"><Input type="number" min="0" value={f.amount} onChange={(e) => setF((s) => ({ ...s, amount: e.target.value }))} className="h-11" /></Field>
              <Field label="Tenure">
                <Select value={f.tenureMonths} onValueChange={(v) => setF((s) => ({ ...s, tenureMonths: v }))}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{TENURES.map((t) => <SelectItem key={t} value={String(t)}>{t} months</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Bank"><Input value={f.bank} onChange={(e) => setF((s) => ({ ...s, bank: e.target.value }))} className="h-11" /></Field>
            </Section>

            <Section title="Collateral & Purpose" cols={1}>
              <Field label="Collateral Description">
                <Textarea value={f.collateral} onChange={(e) => setF((s) => ({ ...s, collateral: e.target.value }))} rows={3} />
              </Field>
              <Field label="Purpose / Use-case">
                <Textarea value={f.purpose} onChange={(e) => setF((s) => ({ ...s, purpose: e.target.value }))} rows={3} />
              </Field>
            </Section>

            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Supporting Files</h3>
                  <p className="text-xs text-muted-foreground mt-1">Optional custom documents (20MB max per file).</p>
                </div>
                <Button type="button" variant="outline" onClick={addAttachmentRow}>
                  <Plus className="h-4 w-4 mr-1" /> Add Upload
                </Button>
              </div>

              {attachments.length > 0 ? (
                <div className="space-y-3">
                  {attachments.map((item) => (
                    <div key={item.id} className="border border-border bg-background p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Input
                          value={item.label}
                          onChange={(e) => updateAttachmentRow(item.id, { label: e.target.value })}
                          placeholder="Document label"
                          className="h-10"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeAttachmentRow(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateAttachmentRow(item.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Description (optional)"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground truncate">
                          {item.file ? `${item.file.originalName} - ${(item.file.size / (1024 * 1024)).toFixed(2)}MB` : "No file uploaded"}
                        </p>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold border border-border hover:border-primary">
                          {item.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {item.uploading ? "Uploading..." : "Upload"}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={uploadAttachmentFile(item.id)}
                            disabled={item.uploading}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setView("list")}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit Application
              </Button>
            </div>
          </form>
        )}

        <Drawer open={Boolean(selectedLoan)} onOpenChange={(open) => !open && setSelectedLoan(null)}>
          <DrawerContent className="max-h-[90vh]">
            {selectedLoan ? (
              <div className="mx-auto w-full max-w-4xl overflow-y-auto">
                <DrawerHeader>
                  <DrawerTitle>Loan Application Details</DrawerTitle>
                  <DrawerDescription>
                    Submitted on {new Date(selectedLoan.submittedAt).toLocaleString()}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4 space-y-5 text-sm">
                  <div className="border border-border bg-surface p-4 grid md:grid-cols-2 gap-3">
                    <InfoRow label="Applicant" value={selectedLoan.applicantName} />
                    <InfoRow label="Email" value={selectedLoan.email} />
                    <InfoRow label="Phone" value={selectedLoan.phone} />
                    <InfoRow label="Status" value={selectedLoan.status.replace("_", " ")} />
                    <InfoRow label="Requested Amount" value={`NGN ${selectedLoan.amount.toLocaleString()}`} />
                    <InfoRow label="Capacity" value={`${selectedLoan.capacityKw} kW`} />
                    <InfoRow label="Tenure" value={`${selectedLoan.tenureMonths} months`} />
                    <InfoRow label="Monthly Income" value={`NGN ${selectedLoan.monthlyIncome.toLocaleString()}`} />
                    <InfoRow label="Bank" value={selectedLoan.bank} />
                  </div>

                  <div className="border border-border bg-surface p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Timeline</p>
                    <ul className="space-y-2">
                      <li className="flex items-start justify-between gap-3 border border-border bg-background p-3">
                        <span>{statusTimelineLabels.submitted}</span>
                        <span className="text-xs text-muted-foreground">{new Date(selectedLoan.submittedAt).toLocaleString()}</span>
                      </li>
                      {selectedLoan.status !== "submitted" ? (
                        <li className="flex items-start justify-between gap-3 border border-border bg-background p-3">
                          <span>{statusTimelineLabels[selectedLoan.status]}</span>
                          <span className="text-xs text-muted-foreground">Updated by admin</span>
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="border border-border bg-surface p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Notes</p>
                    <InfoBlock label="Purpose" value={selectedLoan.purpose} />
                    <InfoBlock label="Collateral" value={selectedLoan.collateral} />
                  </div>

                  <div className="border border-border bg-surface p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Uploaded Files</p>
                    {selectedLoan.attachments && selectedLoan.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedLoan.attachments.map((attachment, index) => (
                          <AttachmentRow key={`${attachment.file.storagePath}-${index}`} attachment={attachment} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No files uploaded.</p>
                    )}
                  </div>
                </div>

                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            ) : null}
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
};

const Section = ({ title, children, cols = 2 }: { title: string; children: React.ReactNode; cols?: 1 | 2 }) => (
  <div>
    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">{title}</h3>
    <div className={cols === 2 ? "grid md:grid-cols-2 gap-5" : "space-y-5"}>{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{label}</label>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    <p className="mt-1">{value}</p>
  </div>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-border bg-background p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm">{value}</p>
  </div>
);

const AttachmentRow = ({ attachment }: { attachment: LoanAttachment }) => (
  <div className="border border-border bg-background p-3">
    <p className="text-sm font-medium">{attachment.label}</p>
    {attachment.description ? (
      <p className="text-xs text-muted-foreground mt-1">{attachment.description}</p>
    ) : null}
    <p className="text-xs text-muted-foreground mt-1">
      {attachment.file.originalName} ({(attachment.file.size / (1024 * 1024)).toFixed(2)}MB)
    </p>
  </div>
);

export default SolarLoan;
