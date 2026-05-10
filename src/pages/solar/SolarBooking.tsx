import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Clock, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { EnergyBooking, useSolarUser, solarStore } from "@/lib/solarAuth";

const NIGERIA_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
] as const;

const FALLBACK_LGA_BY_STATE: Record<string, string[]> = {
  Kano: ["Ajingi","Albasu","Bagwai","Bebeji","Bichi","Bunkure","Dala","Dambatta","Dawakin Kudu","Dawakin Tofa","Doguwa","Fagge","Gabasawa","Garko","Garun Mallam","Gaya","Gezawa","Gwale","Gwarzo","Kabo","Kano Municipal","Karaye","Kibiya","Kiru","Kumbotso","Kunchi","Kura","Madobi","Makoda","Minjibir","Nasarawa","Rano","Rimin Gado","Rogo","Shanono","Sumaila","Takai","Tarauni","Tofa","Tsanyawa","Tudun Wada","Ungogo","Warawa","Wudil"],
  Lagos: ["Agege","Ajeromi-Ifelodun","Alimosho","Amuwo-Odofin","Apapa","Badagry","Epe","Eti-Osa","Ibeju-Lekki","Ifako-Ijaiye","Ikeja","Ikorodu","Kosofe","Lagos Island","Lagos Mainland","Mushin","Ojo","Oshodi-Isolo","Shomolu","Surulere"],
  FCT: ["Abaji","Abuja Municipal","Bwari","Gwagwalada","Kuje","Kwali"],
};

async function fetchLgas(state: string): Promise<string[]> {
  const fallback = FALLBACK_LGA_BY_STATE[state] ?? [];
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`https://nga-states-lga.onrender.com/?state=${encodeURIComponent(state)}`, { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) return fallback;
    const payload = await response.json();
    const fromApi = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.lgas)
          ? payload.lgas
          : [];
    return fromApi.map((item: unknown) => String(item)).filter(Boolean);
  } catch {
    return fallback;
  }
}

const statusBadgeVariant = (status: EnergyBooking["status"]) => {
  if (status === "confirmed") return "default";
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  if (status === "completed") return "default";
  return "secondary";
};

const statusTimelineLabels: Record<EnergyBooking["status"], string> = {
  pending: "Booking submitted",
  approved: "Approved - awaiting payment",
  confirmed: "Payment confirmed - service scheduled",
  completed: "Service completed",
  rejected: "Booking rejected",
};

const SolarBooking = () => {
  const user = useSolarUser()!;
  const [view, setView] = useState<"list" | "create">("list");
  const [bookings, setBookings] = useState<EnergyBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<EnergyBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const [range, setRange] = useState<DateRange | undefined>();
  const [lgas, setLgas] = useState<string[]>(FALLBACK_LGA_BY_STATE.Kano ?? []);
  const [loadingLgas, setLoadingLgas] = useState(false);

  const [form, setForm] = useState({
    applicantName: user.fullName,
    phone: "",
    startTime: "09:00",
    endTime: "17:00",
    capacityKw: "",
    state: "Kano",
    lga: "",
    addressLine: "",
    notes: "",
  });

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookings(await solarStore.myBookings(user.id));
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user.id]);

  useEffect(() => {
    let active = true;
    setLoadingLgas(true);
    fetchLgas(form.state)
      .then((items) => {
        if (!active) return;
        setLgas(items);
        if (form.lga && !items.includes(form.lga)) {
          setForm((prev) => ({ ...prev, lga: "" }));
        }
      })
      .finally(() => {
        if (active) setLoadingLgas(false);
      });
    return () => {
      active = false;
    };
  }, [form.state]);

  const bookedDates = useMemo(() => {
    const out: Date[] = [];
    for (const b of bookings.filter((item) => item.status !== "rejected")) {
      const s = new Date(b.startDate);
      const e = new Date(b.endDate);
      const cur = new Date(s);
      while (cur <= e) {
        out.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return out;
  }, [bookings]);

  const durationDays = range?.from && range?.to
    ? Math.max(1, Math.round((+range.to - +range.from) / 86400000) + 1)
    : range?.from ? 1 : 0;

  const submitConfirmed = async () => {
    setConfirmSubmitOpen(false);
    if (!range?.from) return toast.error("Pick a start date.");
    if (!form.applicantName || !form.phone || !form.capacityKw || !form.state || !form.addressLine) {
      return toast.error("Fill all required fields.");
    }

    const start = range.from;
    const end = range.to ?? range.from;
    const location = [form.addressLine.trim(), form.lga.trim(), form.state.trim()].filter(Boolean).join(", ");

    try {
      setSubmitting(true);
      await solarStore.submitBooking({
        userId: user.id,
        applicantName: form.applicantName,
        phone: form.phone,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        capacityKw: Number(form.capacityKw),
        location,
        notes: form.notes || undefined,
      });
      toast.success("Booking submitted for confirmation.");
      await loadBookings();
      setView("list");
      setRange(undefined);
      setForm((prev) => ({ ...prev, capacityKw: "", addressLine: "", notes: "", lga: "" }));
    } catch (error: any) {
      toast.error(error?.message || "Booking submission failed");
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
      <div className="container-px max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="eyebrow text-primary mb-1">Mobile Energy</p>
              <h1 className="text-3xl md:text-4xl font-bold">Energy Booking</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>View Bookings</Button>
            <Button variant={view === "create" ? "default" : "outline"} onClick={() => setView("create")}>Book Reservation</Button>
          </div>
        </div>

        {view === "list" ? (
          <div className="border border-border bg-surface">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">My Booking Requests</p>
            </div>
            {loadingBookings ? (
              <div className="p-6 text-sm text-muted-foreground">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No booking yet. Click "Book Reservation" to create one.</div>
            ) : (
              <div className="divide-y divide-border">
                {bookings.map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold">{booking.capacityKw} kW - {booking.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.startDate).toLocaleDateString()} {booking.startTime} to {new Date(booking.endDate).toLocaleDateString()} {booking.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusBadgeVariant(booking.status)}>{booking.statusLabel || booking.status}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
            <div className="bg-surface border border-border p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">Select Date Range</p>
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                disabled={{ before: new Date() }}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{ booked: "bg-destructive/15 text-destructive line-through" }}
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="mt-4 grid md:grid-cols-3 gap-3 text-xs">
                <div className="border border-border bg-background p-3">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold mt-1">{durationDays > 0 ? `${durationDays} day(s)` : "Not selected"}</p>
                </div>
                <div className="border border-border bg-background p-3">
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-semibold mt-1">{range?.from ? new Date(range.from).toLocaleDateString() : "-"}</p>
                </div>
                <div className="border border-border bg-background p-3">
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-semibold mt-1">{range?.to ? new Date(range.to).toLocaleDateString() : range?.from ? new Date(range.from).toLocaleDateString() : "-"}</p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="bg-surface border border-border p-6 shadow-card space-y-5">
              <Field label="Full Name"><Input value={form.applicantName} onChange={(e) => setForm((s) => ({ ...s, applicantName: e.target.value }))} className="h-11" /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} placeholder="+234..." className="h-11" /></Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={<span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Start Time</span>}>
                  <Input type="time" value={form.startTime} onChange={(e) => setForm((s) => ({ ...s, startTime: e.target.value }))} className="h-11" />
                </Field>
                <Field label={<span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> End Time</span>}>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm((s) => ({ ...s, endTime: e.target.value }))} className="h-11" />
                </Field>
              </div>

              <Field label="Required Capacity (kW)">
                <Input type="number" min="0" step="0.1" value={form.capacityKw} onChange={(e) => setForm((s) => ({ ...s, capacityKw: e.target.value }))} className="h-11" />
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="State">
                  <Select value={form.state} onValueChange={(value) => setForm((prev) => ({ ...prev, state: value }))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NIGERIA_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Local Government (Optional)">
                  <Select value={form.lga} onValueChange={(value) => setForm((prev) => ({ ...prev, lga: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={loadingLgas ? "Loading LGA..." : "Select LGA"} />
                    </SelectTrigger>
                    <SelectContent>
                      {lgas.length === 0 ? (
                        <SelectItem value="none" disabled>No LGA available</SelectItem>
                      ) : (
                        lgas.map((lga) => <SelectItem key={lga} value={lga}>{lga}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label={<span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Address / Landmark</span>}>
                <Input value={form.addressLine} onChange={(e) => setForm((s) => ({ ...s, addressLine: e.target.value }))} placeholder="Street, landmark, venue or site address" className="h-11" />
              </Field>
              <Field label="Notes (Optional)">
                <Textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} rows={3} />
              </Field>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setView("list")}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Submit Booking
                </Button>
              </div>
            </form>
          </div>
        )}

        <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Booking Request?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm you want to submit this mobile energy booking request.
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

        <Drawer open={Boolean(selectedBooking)} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DrawerContent className="max-h-[90vh]">
            {selectedBooking ? (
              <div className="mx-auto w-full max-w-4xl overflow-y-auto">
                <DrawerHeader>
                  <DrawerTitle>Booking Details</DrawerTitle>
                  <DrawerDescription>
                    Submitted on {new Date(selectedBooking.submittedAt).toLocaleString()}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-4 space-y-5 text-sm">
                  <div className="border border-border bg-surface p-4 grid md:grid-cols-2 gap-3">
                    <InfoRow label="Applicant" value={selectedBooking.applicantName} />
                    <InfoRow label="Phone" value={selectedBooking.phone} />
                    <InfoRow label="Status" value={selectedBooking.statusLabel || selectedBooking.status} />
                    <InfoRow label="Capacity" value={`${selectedBooking.capacityKw} kW`} />
                    <InfoRow label="Start" value={`${new Date(selectedBooking.startDate).toLocaleDateString()} ${selectedBooking.startTime}`} />
                    <InfoRow label="End" value={`${new Date(selectedBooking.endDate).toLocaleDateString()} ${selectedBooking.endTime}`} />
                    <InfoRow label="Location" value={selectedBooking.location} />
                  </div>

                  <div className="border border-border bg-surface p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Timeline</p>
                    <ul className="space-y-2">
                      <li className="flex items-start justify-between gap-3 border border-border bg-background p-3">
                        <span>{statusTimelineLabels.pending}</span>
                        <span className="text-xs text-muted-foreground">{new Date(selectedBooking.submittedAt).toLocaleString()}</span>
                      </li>
                      {selectedBooking.status !== "pending" ? (
                        <li className="flex items-start justify-between gap-3 border border-border bg-background p-3">
                          <span>{statusTimelineLabels[selectedBooking.status]}</span>
                          <span className="text-xs text-muted-foreground">Updated by admin</span>
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="border border-border bg-surface p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Notes</p>
                    <p className="border border-border bg-background p-3">{selectedBooking.notes?.trim() || "No notes provided."}</p>
                  </div>

                  <div className="border border-border bg-surface p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Uploaded Files</p>
                    <p className="text-xs text-muted-foreground">No uploaded files for bookings yet.</p>
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

const Field = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
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

export default SolarBooking;
