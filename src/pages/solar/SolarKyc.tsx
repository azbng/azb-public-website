import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ShieldCheck, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UploadedFile, useSolarUser, solarStore } from "@/lib/solarAuth";

type IdentityType = "NIN" | "License" | "Passport" | "VotersCard";

const ID_OPTIONS: Array<{ value: IdentityType; label: string }> = [
  { value: "NIN", label: "NIN" },
  { value: "License", label: "Driver's License" },
  { value: "Passport", label: "Passport" },
  { value: "VotersCard", label: "Voter's Card" },
];

const SolarKyc = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user.fullName,
    dob: "",
    address: "",
    identityType: "NIN" as IdentityType,
    identityNumber: "",
  });
  const [identityFile, setIdentityFile] = useState<UploadedFile | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState<"identity" | "proof" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [existingStatus, setExistingStatus] = useState<"pending" | "approved" | "rejected" | null>(null);

  useEffect(() => {
    let mounted = true;
    solarStore
      .myKyc(user.id)
      .then((existing) => {
        if (!mounted || !existing) return;
        setForm((prev) => ({
          ...prev,
          fullName: existing.fullName || user.fullName,
          dob: existing.dob || "",
          address: existing.address || "",
          identityNumber: existing.nin || "",
        }));
        setExistingStatus(existing.status);

        const idDoc = existing.documents.find((entry) =>
          entry.type === "NIN" || entry.type === "License" || entry.type === "Passport" || entry.type === "VotersCard",
        );
        if (idDoc) {
          setForm((prev) => ({ ...prev, identityType: idDoc.type as IdentityType }));
          setIdentityFile(idDoc.file);
        }
        const poa = existing.documents.find((entry) => entry.type === "ProofOfAddress");
        if (poa) setProofOfAddressFile(poa.file);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [user.fullName, user.id]);

  const uploadDoc = (slot: "identity" | "proof") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit.");
      e.target.value = "";
      return;
    }
    try {
      setUploading(slot);
      const uploaded = await solarStore.uploadFile(file);
      if (slot === "identity") {
        setIdentityFile(uploaded);
        toast.success("Identity document uploaded.");
      } else {
        setProofOfAddressFile(uploaded);
        toast.success("Proof of address uploaded.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const submitConfirmed = async () => {
    setConfirmSubmitOpen(false);
    if (!form.fullName || !form.dob || !form.address || !form.identityNumber.trim()) {
      toast.error("Fill all required fields.");
      return;
    }
    if (!identityFile) {
      toast.error("Upload your identity document.");
      return;
    }
    if (!proofOfAddressFile) {
      toast.error("Proof of address document is required.");
      return;
    }

    try {
      setSubmitting(true);
      await solarStore.submitKyc({
        userId: user.id,
        fullName: form.fullName,
        dob: form.dob,
        address: form.address,
        nin: form.identityNumber.trim(),
        documents: [
          { type: form.identityType, file: identityFile },
          { type: "ProofOfAddress", file: proofOfAddressFile },
        ],
      });
      toast.success("KYC submitted for review.");
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "KYC submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSubmitOpen(true);
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="eyebrow text-primary mb-1">Verification</p>
              <h1 className="text-3xl md:text-4xl font-bold">KYC Submission</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Max 20MB per file
          </div>
        </div>

        {existingStatus ? (
          <div className="mb-5 border border-border bg-surface p-4 flex items-center justify-between">
            <p className="text-sm">Current KYC Status</p>
            <Badge variant={existingStatus === "approved" ? "default" : existingStatus === "rejected" ? "destructive" : "secondary"}>
              {existingStatus}
            </Badge>
          </div>
        ) : null}

        <form onSubmit={submit} className="bg-surface border border-border p-6 md:p-8 shadow-card space-y-7">
          <div className="grid md:grid-cols-2 gap-5">
            <Labeled label="Full Legal Name">
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="h-11" />
            </Labeled>
            <Labeled label="Date of Birth">
              <Input type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} className="h-11" />
            </Labeled>
            <Labeled label="ID Type">
              <Select value={form.identityType} onValueChange={(value) => setForm((prev) => ({ ...prev, identityType: value as IdentityType }))}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ID_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>
            <Labeled label="ID Number">
              <Input value={form.identityNumber} onChange={(e) => setForm((f) => ({ ...f, identityNumber: e.target.value }))} placeholder="Enter selected ID number" className="h-11" />
            </Labeled>
            <Labeled label="Residential Address" className="md:col-span-2">
              <Textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} rows={2} placeholder="Street, city, state" />
            </Labeled>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Identity Document</p>
              <p className="text-xs text-muted-foreground">Upload file for the selected ID type.</p>
            </div>
            <UploadCard
              label={ID_OPTIONS.find((item) => item.value === form.identityType)?.label ?? "Identity"}
              file={identityFile}
              uploading={uploading === "identity"}
              onUpload={uploadDoc("identity")}
              onRemove={() => setIdentityFile(null)}
            />
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <div>
              <p className="text-sm font-semibold">Proof of Address</p>
              <p className="text-xs text-muted-foreground">Upload utility bill, tenancy document, or related proof.</p>
            </div>
            <UploadCard
              label="Proof of Address"
              file={proofOfAddressFile}
              uploading={uploading === "proof"}
              onUpload={uploadDoc("proof")}
              onRemove={() => setProofOfAddressFile(null)}
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-11 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit KYC
            </button>
          </div>
        </form>

        <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit KYC Request?</AlertDialogTitle>
              <AlertDialogDescription>
                Please confirm you want to submit this KYC information for review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void submitConfirmed()} disabled={submitting}>
                Confirm Submission
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

const UploadCard = ({
  label,
  file,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  file: UploadedFile | null;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) => (
  <div className="border border-dashed border-border bg-background p-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <FileText className="h-5 w-5 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {file ? (
          <p className="text-xs text-muted-foreground truncate">{file.originalName} - {(file.size / (1024 * 1024)).toFixed(2)}MB</p>
        ) : (
          <p className="text-xs text-muted-foreground">No file</p>
        )}
      </div>
    </div>
    {file ? (
      <button type="button" onClick={onRemove} className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-destructive">
        <X className="h-4 w-4" />
      </button>
    ) : (
      <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] bg-primary hover:bg-primary-glow text-primary-foreground transition-smooth">
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading ? "Uploading..." : "Upload"}
        <input type="file" accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={onUpload} disabled={uploading} />
      </label>
    )}
  </div>
);

const Labeled = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{label}</label>
    {children}
  </div>
);

export default SolarKyc;
