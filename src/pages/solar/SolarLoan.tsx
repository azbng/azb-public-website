import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sun, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LoanAttachment, UploadedFile, useSolarUser, solarStore } from "@/lib/solarAuth";

const TENURES = [6, 12, 24, 36, 48, 60];

type DraftAttachment = {
  id: string;
  label: string;
  description: string;
  file?: UploadedFile;
  uploading?: boolean;
};

const SolarLoan = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
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

  const addAttachmentRow = () => {
    setAttachments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", description: "" },
    ]);
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
        toast.error("Please fill all fields.");
        return;
      }
    }

    const incompleteAttachment = attachments.find((item) => item.label.trim() || item.description.trim() || item.file)
      && attachments.some((item) => (item.label.trim() || item.description.trim() || item.file) && (!item.label.trim() || !item.file));
    if (incompleteAttachment) {
      toast.error("Each attachment must have a document label and uploaded file.");
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
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Loan submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="eyebrow text-primary mb-1 flex items-center gap-2"><Sun className="h-3 w-3" /> Solar Financing</p>
            <h1 className="text-3xl md:text-4xl font-bold">Solar Loan Application</h1>
          </div>
        </div>

        <form onSubmit={submit} className="bg-surface border border-border p-6 md:p-8 shadow-card space-y-7">
          <Section title="Applicant">
            <Field label="Full Name"><Input value={f.applicantName} onChange={(e) => setF((s) => ({ ...s, applicantName: e.target.value }))} className="h-11" /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))} className="h-11" /></Field>
            <Field label="Phone"><Input value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))} placeholder="+234..." className="h-11" /></Field>
            <Field label="Monthly Income (NGN)"><Input type="number" min="0" value={f.monthlyIncome} onChange={(e) => setF((s) => ({ ...s, monthlyIncome: e.target.value }))} className="h-11" /></Field>
          </Section>

          <Section title="Solar System">
            <Field label="Capacity (kW)"><Input type="number" min="0" step="0.1" value={f.capacityKw} onChange={(e) => setF((s) => ({ ...s, capacityKw: e.target.value }))} placeholder="e.g. 5" className="h-11" /></Field>
            <Field label="Loan Amount (NGN)"><Input type="number" min="0" value={f.amount} onChange={(e) => setF((s) => ({ ...s, amount: e.target.value }))} placeholder="e.g. 8000000" className="h-11" /></Field>
            <Field label="Tenure">
              <Select value={f.tenureMonths} onValueChange={(v) => setF((s) => ({ ...s, tenureMonths: v }))}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{TENURES.map((t) => <SelectItem key={t} value={String(t)}>{t} months</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Bank"><Input value={f.bank} onChange={(e) => setF((s) => ({ ...s, bank: e.target.value }))} placeholder="Your primary bank" className="h-11" /></Field>
          </Section>

          <Section title="Collateral & Purpose" cols={1}>
            <Field label="Collateral Description">
              <Textarea value={f.collateral} onChange={(e) => setF((s) => ({ ...s, collateral: e.target.value }))} rows={3} placeholder="Describe collateral offered (property, asset, guarantor, etc.)" />
            </Field>
            <Field label="Purpose / Use-case">
              <Textarea value={f.purpose} onChange={(e) => setF((s) => ({ ...s, purpose: e.target.value }))} rows={3} placeholder="Residential, commercial, agricultural, etc." />
            </Field>
          </Section>

          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Supporting Files</h3>
                <p className="text-xs text-muted-foreground mt-1">Optional custom documents (20MB max per file).</p>
              </div>
              <button
                type="button"
                onClick={addAttachmentRow}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] border border-border hover:border-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Upload
              </button>
            </div>

            {attachments.length > 0 ? (
              <div className="space-y-3">
                {attachments.map((item) => (
                  <div key={item.id} className="border border-border bg-background p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Input
                        value={item.label}
                        onChange={(e) => updateAttachmentRow(item.id, { label: e.target.value })}
                        placeholder="Document label (e.g. Utility Bill)"
                        className="h-10"
                      />
                      <button type="button" onClick={() => removeAttachmentRow(item.id)} className="h-9 w-9 grid place-items-center border border-border hover:border-destructive text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                      <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] bg-primary hover:bg-primary-glow text-primary-foreground transition-smooth">
                        {item.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
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

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-11 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Application
            </button>
          </div>
        </form>
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

export default SolarLoan;



