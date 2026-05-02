import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { EnergyBooking, useSolarUser, solarStore } from "@/lib/solarAuth";

const SolarBooking = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [allBookings, setAllBookings] = useState<EnergyBooking[]>([]);

  const [range, setRange] = useState<DateRange | undefined>();
  const [form, setForm] = useState({
    applicantName: user.fullName, phone: "",
    startTime: "09:00", endTime: "17:00",
    capacityKw: "", location: "", notes: "",
  });

  useEffect(() => {
    let mounted = true;
    solarStore
      .listBookings()
      .then((items) => {
        if (mounted) setAllBookings(items.filter((item) => item.status !== "cancelled"));
      })
      .catch(() => {
        if (mounted) setAllBookings([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Mark booked dates with a modifier so the calendar shows them.
  const bookedDates = useMemo(() => {
    const out: Date[] = [];
    for (const b of allBookings) {
      const s = new Date(b.startDate); const e = new Date(b.endDate);
      const cur = new Date(s);
      while (cur <= e) { out.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    }
    return out;
  }, [allBookings]);

  const durationDays = range?.from && range?.to
    ? Math.max(1, Math.round((+range.to - +range.from) / 86400000) + 1)
    : range?.from ? 1 : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from) { toast.error("Pick a start date"); return; }
    if (!form.applicantName || !form.phone || !form.capacityKw || !form.location) { toast.error("Fill all required fields"); return; }
    const start = range.from; const end = range.to ?? range.from;
    try {
      await solarStore.submitBooking({
        userId: user.id,
        applicantName: form.applicantName,
        phone: form.phone,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        capacityKw: Number(form.capacityKw),
        location: form.location,
        notes: form.notes || undefined,
      });
      toast.success("Booking submitted for confirmation");
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Booking submission failed");
    }
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="eyebrow text-primary mb-1">Mobile Energy</p>
            <h1 className="text-3xl md:text-4xl font-bold">Book Solar Energy Unit</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Pick Date Range</p>
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
              modifiers={{ booked: bookedDates }}
              modifiersClassNames={{ booked: "bg-destructive/15 text-destructive line-through" }}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-primary inline-block" /> Selected</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-destructive/40 inline-block" /> Booked</span>
              </div>
              <span>{durationDays > 0 ? `${durationDays} day(s)` : "—"}</span>
            </div>

            {allBookings.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">Existing bookings</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allBookings.slice(0, 8).map(b => (
                    <div key={b.id} className="text-xs border border-border bg-background p-2 flex justify-between">
                      <span>{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</span>
                      <span className="text-muted-foreground">{b.capacityKw} kW</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="bg-surface border border-border p-6 shadow-card space-y-5">
            <Field label="Full Name"><Input value={form.applicantName} onChange={e => setForm(s => ({ ...s, applicantName: e.target.value }))} className="h-11" /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} placeholder="+234..." className="h-11" /></Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={<span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Start time</span>}>
                <Input type="time" value={form.startTime} onChange={e => setForm(s => ({ ...s, startTime: e.target.value }))} className="h-11" />
              </Field>
              <Field label={<span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> End time</span>}>
                <Input type="time" value={form.endTime} onChange={e => setForm(s => ({ ...s, endTime: e.target.value }))} className="h-11" />
              </Field>
            </div>

            <Field label="Required Capacity (kW)"><Input type="number" min="0" step="0.1" value={form.capacityKw} onChange={e => setForm(s => ({ ...s, capacityKw: e.target.value }))} placeholder="e.g. 10" className="h-11" /></Field>
            <Field label="Location"><Input value={form.location} onChange={e => setForm(s => ({ ...s, location: e.target.value }))} placeholder="Event/site address" className="h-11" /></Field>
            <Field label="Notes (optional)"><Textarea value={form.notes} onChange={e => setForm(s => ({ ...s, notes: e.target.value }))} rows={3} placeholder="Special requirements, access info, etc." /></Field>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-11 px-8 text-xs font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant">
              Submit Booking
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{label}</label>
    {children}
  </div>
);

export default SolarBooking;
