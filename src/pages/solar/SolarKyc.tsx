import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ShieldCheck, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UploadedFile, useSolarUser, solarStore } from "@/lib/solarAuth";

type DocType = "ID" | "License" | "NIN" | "Passport" | "ProofOfAddress";

const DOC_TYPES: Array<{ type: DocType; label: string; required?: boolean }> = [
  { type: "ID", label: "ID" },
  { type: "License", label: "License" },
  { type: "NIN", label: "NIN" },
  { type: "Passport", label: "Passport" },
  { type: "ProofOfAddress", label: "Proof of Address", required: true },
];

const identityTypes: DocType[] = ["ID", "License", "NIN", "Passport"];

const SolarKyc = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user.fullName,
    dob: "",
    address: "",
    nin: "",
  });
  const [docsByType, setDocsByType] = useState<Partial<Record<DocType, UploadedFile>>>({});
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    solarStore
      .myKyc(user.id)
      .then((existing) => {
        if (!mounted || !existing) return;
        setForm({
          fullName: existing.fullName || user.fullName,
          dob: existing.dob || "",
          address: existing.address || "",
          nin: existing.nin || "",
        });
        const nextDocs: Partial<Record<DocType, UploadedFile>> = {};
        for (const entry of existing.documents || []) {
          nextDocs[entry.type] = entry.file;
        }
        setDocsByType(nextDocs);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [user.fullName, user.id]);

  const identityUploaded = useMemo(
    () => identityTypes.some((type) => Boolean(docsByType[type])),
    [docsByType],
  );

  const uploadDoc = (type: DocType) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit.");
      e.target.value = "";
      return;
    }
    try {
      setUploadingType(type);
      const uploaded = await solarStore.uploadFile(file);
      setDocsByType((prev) => ({ ...prev, [type]: uploaded }));
      toast.success(`${type === "ProofOfAddress" ? "Proof of Address" : type} uploaded`);
    } catch (error: any) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setUploadingType(null);
      e.target.value = "";
    }
  };

  const removeDoc = (type: DocType) => {
    setDocsByType((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.dob || !form.address || !form.nin) {
      toast.error("Fill all profile fields.");
      return;
    }
    if (!identityUploaded) {
      toast.error("Upload at least one identity document (ID, License, NIN, or Passport).");
      return;
    }
    if (!docsByType.ProofOfAddress) {
      toast.error("Proof of address is required.");
      return;
    }

    const documents = Object.entries(docsByType)
      .filter(([, file]) => Boolean(file))
      .map(([type, file]) => ({
        type: type as DocType,
        file: file as UploadedFile,
      }));

    try {
      setSubmitting(true);
      await solarStore.submitKyc({ userId: user.id, ...form, documents });
      toast.success("KYC submitted for review.");
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "KYC submission failed");
    } finally {
      setSubmitting(false);
    }
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

        <form onSubmit={submit} className="bg-surface border border-border p-6 md:p-8 shadow-card space-y-7">
          <div className="grid md:grid-cols-2 gap-5">
            <Labeled label="Full Legal Name">
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="h-11" />
            </Labeled>
            <Labeled label="Date of Birth">
              <Input type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} className="h-11" />
            </Labeled>
            <Labeled label="NIN Number">
              <Input value={form.nin} onChange={(e) => setForm((f) => ({ ...f, nin: e.target.value }))} placeholder="National ID Number" className="h-11" />
            </Labeled>
            <Labeled label="Residential Address" className="md:col-span-2">
              <Textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} rows={2} placeholder="Street, city, state" />
            </Labeled>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Document Uploads</p>
              <p className="text-xs text-muted-foreground">Upload one identity document and proof of address.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {DOC_TYPES.map((entry) => {
                const doc = docsByType[entry.type];
                const uploading = uploadingType === entry.type;
                return (
                  <div key={entry.type} className="border border-dashed border-border bg-background p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {entry.label}
                          {entry.required ? <span className="text-destructive ml-1">*</span> : null}
                        </p>
                        {doc ? (
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.originalName} - {(doc.size / (1024 * 1024)).toFixed(2)}MB
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No file</p>
                        )}
                      </div>
                    </div>
                    {doc ? (
                      <button type="button" onClick={() => removeDoc(entry.type)} className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] bg-primary hover:bg-primary-glow text-primary-foreground transition-smooth">
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {uploading ? "Uploading..." : "Upload"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={uploadDoc(entry.type)}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
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
      </div>
    </section>
  );
};

const Labeled = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{label}</label>
    {children}
  </div>
);

export default SolarKyc;



