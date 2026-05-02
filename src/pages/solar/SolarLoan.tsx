import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSolarUser, solarStore } from "@/lib/solarAuth";

const TENURES = [6, 12, 24, 36, 48, 60];

const SolarLoan = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [f, setF] = useState({
    applicantName: user.fullName, email: user.email, phone: "",
    capacityKw: "", amount: "", tenureMonths: "12",
    collateral: "", bank: "", monthlyIncome: "", purpose: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["applicantName","email","phone","capacityKw","amount","collateral","bank","monthlyIncome","purpose"] as const;
    for (const k of required) if (!String(f[k]).trim()) { toast.error("Please fill all fields"); return; }
    try {
      await solarStore.submitLoan({
        userId: user.id,
        applicantName: f.applicantName, email: f.email, phone: f.phone,
        capacityKw: Number(f.capacityKw), amount: Number(f.amount),
        tenureMonths: Number(f.tenureMonths),
        collateral: f.collateral, bank: f.bank,
        monthlyIncome: Number(f.monthlyIncome), purpose: f.purpose,
      });
      toast.success("Loan application submitted");
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Loan submission failed");
    }
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="eyebrow text-primary mb-1 flex items-center gap-2"><Sun className="h-3 w-3" /> Solar Financing</p>
            <h1 className="text-3xl md:text-4xl font-bold">Solar Loan Application</h1>
          </div>
        </div>

        <form onSubmit={submit} className="bg-surface border border-border p-6 md:p-8 shadow-card space-y-6">
          <Section title="Applicant">
            <Field label="Full Name"><Input value={f.applicantName} onChange={e => setF(s => ({ ...s, applicantName: e.target.value }))} className="h-11" /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={e => setF(s => ({ ...s, email: e.target.value }))} className="h-11" /></Field>
            <Field label="Phone"><Input value={f.phone} onChange={e => setF(s => ({ ...s, phone: e.target.value }))} placeholder="+234..." className="h-11" /></Field>
            <Field label="Monthly Income (USD)"><Input type="number" min="0" value={f.monthlyIncome} onChange={e => setF(s => ({ ...s, monthlyIncome: e.target.value }))} className="h-11" /></Field>
          </Section>

          <Section title="Solar System">
            <Field label="Capacity (kW)"><Input type="number" min="0" step="0.1" value={f.capacityKw} onChange={e => setF(s => ({ ...s, capacityKw: e.target.value }))} placeholder="e.g. 5" className="h-11" /></Field>
            <Field label="Loan Amount (USD)"><Input type="number" min="0" value={f.amount} onChange={e => setF(s => ({ ...s, amount: e.target.value }))} placeholder="e.g. 8000" className="h-11" /></Field>
            <Field label="Tenure">
              <Select value={f.tenureMonths} onValueChange={v => setF(s => ({ ...s, tenureMonths: v }))}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{TENURES.map(t => <SelectItem key={t} value={String(t)}>{t} months</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Bank"><Input value={f.bank} onChange={e => setF(s => ({ ...s, bank: e.target.value }))} placeholder="Your primary bank" className="h-11" /></Field>
          </Section>

          <Section title="Collateral & Purpose" cols={1}>
            <Field label="Collateral Description">
              <Textarea value={f.collateral} onChange={e => setF(s => ({ ...s, collateral: e.target.value }))} rows={3} placeholder="Describe the collateral offered to the bank (property, asset, guarantor, etc.)" />
            </Field>
            <Field label="Purpose / Use-case">
              <Textarea value={f.purpose} onChange={e => setF(s => ({ ...s, purpose: e.target.value }))} rows={3} placeholder="Residential, commercial, agricultural, etc." />
            </Field>
          </Section>

          <div className="flex justify-end pt-2 border-t border-border">
            <button type="submit" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-11 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant">
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
