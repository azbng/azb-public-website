import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ShieldCheck, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSolarUser, solarStore } from "@/lib/solarAuth";

type DocType = "ID" | "License" | "NIN" | "Passport";
type Doc = { type: DocType; name: string; size: number };

const DOC_TYPES: DocType[] = ["ID", "License", "NIN", "Passport"];

const SolarKyc = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user.fullName,
    dob: "",
    address: "",
    nin: "",
  });
  const [docs, setDocs] = useState<Doc[]>([]);

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
        setDocs(existing.documents || []);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [user.fullName, user.id]);

  const addDoc = (type: DocType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("File must be under 8MB"); return; }
    setDocs(d => [...d.filter(x => x.type !== type), { type, name: file.name, size: file.size }]);
    e.target.value = "";
    toast.success(`${type} uploaded`);
  };

  const removeDoc = (type: DocType) => setDocs(d => d.filter(x => x.type !== type));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.dob || !form.address || !form.nin) { toast.error("Fill all profile fields"); return; }
    if (docs.length === 0) { toast.error("Upload at least one document"); return; }
    try {
      await solarStore.submitKyc({ userId: user.id, ...form, documents: docs });
      toast.success("KYC submitted for review");
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "KYC submission failed");
    }
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="eyebrow text-primary mb-1">Verification</p>
            <h1 className="text-3xl md:text-4xl font-bold">KYC Submission</h1>
          </div>
        </div>

        <form onSubmit={submit} className="bg-surface border border-border p-6 md:p-8 shadow-card space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Labeled label="Full Legal Name">
              <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="h-11" />
            </Labeled>
            <Labeled label="Date of Birth">
              <Input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} className="h-11" />
            </Labeled>
            <Labeled label="NIN Number" className="md:col-span-1">
              <Input value={form.nin} onChange={e => setForm(f => ({ ...f, nin: e.target.value }))} placeholder="National ID Number" className="h-11" />
            </Labeled>
            <Labeled label="Residential Address" className="md:col-span-2">
              <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} placeholder="Street, city, state" />
            </Labeled>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Identity Documents</p>
            <p className="text-xs text-muted-foreground mb-4">Upload one or more. PDF, JPG, PNG up to 8MB.</p>
            <div className="grid md:grid-cols-2 gap-3">
              {DOC_TYPES.map(type => {
                const doc = docs.find(d => d.type === type);
                return (
                  <div key={type} className="border border-dashed border-border bg-background p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{type}</p>
                        {doc ? (
                          <p className="text-xs text-muted-foreground truncate">{doc.name} · {(doc.size/1024).toFixed(0)}KB</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No file</p>
                        )}
                      </div>
                    </div>
                    {doc ? (
                      <button type="button" onClick={() => removeDoc(type)} className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] bg-primary hover:bg-primary-glow text-primary-foreground transition-smooth">
                        <Upload className="h-3 w-3" /> Upload
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={addDoc(type)} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button type="submit" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-11 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant">
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
