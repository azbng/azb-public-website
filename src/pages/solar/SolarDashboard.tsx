import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, CalendarDays, ArrowRight, CheckCircle2, Clock, XCircle, User2, Bell } from "lucide-react";
import { KycSubmission, LoanApplication, EnergyBooking, PortalNotification, useSolarUser, solarStore } from "@/lib/solarAuth";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    pending: { icon: <Clock className="h-3 w-3" />, cls: "bg-accent/15 text-accent border-accent/40", label: "Pending" },
    submitted: { icon: <Clock className="h-3 w-3" />, cls: "bg-accent/15 text-accent border-accent/40", label: "Submitted" },
    under_review: { icon: <Clock className="h-3 w-3" />, cls: "bg-accent/15 text-accent border-accent/40", label: "Under Review" },
    approved: { icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40", label: "Approved" },
    confirmed: { icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40", label: "Confirmed" },
    completed: { icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-emerald-700/15 text-emerald-700 border-emerald-700/40", label: "Completed" },
    rejected: { icon: <XCircle className="h-3 w-3" />, cls: "bg-destructive/15 text-destructive border-destructive/40", label: "Rejected" },
  };
  const m = map[status] ?? map.pending;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] border ${m.cls}`}>{m.icon}{m.label}</span>;
};

const SolarDashboard = () => {
  const user = useSolarUser()!;
  const navigate = useNavigate();
  const [kyc, setKyc] = useState<KycSubmission | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [bookings, setBookings] = useState<EnergyBooking[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([solarStore.myKyc(user.id), solarStore.myLoans(user.id), solarStore.myBookings(user.id), solarStore.listNotifications()])
      .then(([kycResult, loanResults, bookingResults, notificationResults]) => {
        if (!mounted) return;
        setKyc(kycResult);
        setLoans(loanResults);
        setBookings(bookingResults);
        setNotifications(notificationResults);
      })
      .catch(() => {
        if (!mounted) return;
        setKyc(null);
        setLoans([]);
        setBookings([]);
        setNotifications([]);
      });

    return () => {
      mounted = false;
    };
  }, [user.id]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );
  const loanPendingCount = useMemo(
    () => loans.filter((item) => item.status === "submitted" || item.status === "under_review").length,
    [loans],
  );
  const loanApprovedCount = useMemo(
    () => loans.filter((item) => item.status === "approved").length,
    [loans],
  );
  const bookingPendingCount = useMemo(
    () => bookings.filter((item) => item.status === "pending").length,
    [bookings],
  );
  const bookingConfirmedCount = useMemo(
    () => bookings.filter((item) => item.status === "confirmed").length,
    [bookings],
  );
  const resolveNotificationPath = (item: PortalNotification) => {
    const type = item.type || "";
    const data = item.data && typeof item.data === "object" ? (item.data as Record<string, unknown>) : {};
    if (type.includes("kyc") || data.applicationType === "kyc") return "/subsidiaries/solar/kyc";
    if (type.includes("loan") || data.applicationType === "loan") return "/subsidiaries/solar/loan";
    if (type.includes("booking") || data.applicationType === "booking") return "/subsidiaries/solar/booking";
    return "/subsidiaries/solar/dashboard";
  };

  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary mb-2">My Portal</p>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Welcome, {user.fullName}</h1>
            <p className="text-muted-foreground">Track KYC, loan applications, and energy bookings in one place.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bell className="h-4 w-4" />
            {unreadCount} unread notification(s)
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard title="KYC Status" value={kyc ? "Submitted" : "Not Submitted"} />
          <StatCard title="Loan Applications" value={String(loans.length)} />
          <StatCard title="Energy Bookings" value={String(bookings.length)} />
          <StatCard title="Unread Alerts" value={String(unreadCount)} />
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Loans Pending" value={String(loanPendingCount)} />
          <StatCard title="Loans Approved" value={String(loanApprovedCount)} />
          <StatCard title="Bookings Pending" value={String(bookingPendingCount)} />
          <StatCard title="Bookings Confirmed" value={String(bookingConfirmedCount)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-surface border border-border p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
                <User2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Profile</p>
                <p className="font-semibold">{user.fullName}</p>
              </div>
            </div>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium truncate ml-3">{user.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Provider</dt><dd className="font-medium capitalize">{user.provider}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Role</dt><dd className="font-medium capitalize">{user.role}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Member since</dt><dd className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>

          <div className="lg:col-span-2 bg-surface border border-border p-6 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">KYC Verification</p>
                  <p className="font-semibold">{kyc ? "Submitted" : "Not submitted"}</p>
                </div>
              </div>
              {kyc ? <StatusBadge status={kyc.status} /> : null}
            </div>
            {kyc ? (
              <div className="text-sm text-muted-foreground space-y-1.5">
                <p><span className="text-foreground font-medium">{kyc.documents.length}</span> document(s) uploaded - NIN: {kyc.nin}</p>
                <p>Submitted {new Date(kyc.submittedAt).toLocaleString()}</p>
                <Link to="/subsidiaries/solar/kyc" className="inline-flex items-center gap-1 text-primary hover:text-primary-glow text-xs font-semibold uppercase tracking-[0.15em] mt-2">Update KYC <ArrowRight className="h-3 w-3" /></Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">Complete KYC only when you want to apply for a solar loan. Energy booking does not require KYC.</p>
                <Link to="/subsidiaries/solar/kyc" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-10 px-5 text-xs font-semibold uppercase tracking-[0.15em] transition-smooth">
                  Start KYC <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ServiceCard
            icon={<FileText className="h-6 w-6" />}
            title="Solar Loan"
            desc="Apply for financing or review application progress."
            cta="Manage Loans"
            to="/subsidiaries/solar/loan"
          />
          <ServiceCard
            icon={<CalendarDays className="h-6 w-6" />}
            title="Energy Booking"
            desc="Create a reservation and track booking approvals."
            cta="Manage Bookings"
            to="/subsidiaries/solar/booking"
          />
        </div>

        <SectionList title="Notifications" empty="No notifications yet.">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={async () => {
                if (!item.isRead) {
                  await solarStore.markNotificationRead(item.id);
                  setNotifications((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
                }
                navigate(resolveNotificationPath(item));
              }}
              className={`w-full text-left border p-4 ${item.isRead ? "border-border bg-background" : "border-primary/40 bg-primary/5"}`}
            >
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
              <p className="text-[11px] text-muted-foreground mt-2">{new Date(item.createdAt).toLocaleString()}</p>
            </button>
          ))}
        </SectionList>

        <SectionList title="My Loan Applications" empty="No applications yet.">
          {loans.map((l) => (
            <div key={l.id} className="flex items-center justify-between border border-border bg-background p-4">
              <div>
                <p className="font-semibold text-sm">{l.amount && l.amount > 0 ? `NGN ${l.amount.toLocaleString()}` : "Amount to be set by admin"} - {l.capacityKw} kW - {l.tenureMonths} months</p>
                <p className="text-xs text-muted-foreground">{new Date(l.submittedAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </SectionList>

        <SectionList title="My Energy Bookings" empty="No bookings yet.">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between border border-border bg-background p-4">
              <div>
                <p className="font-semibold text-sm">{b.capacityKw} kW - {b.location}</p>
                <p className="text-xs text-muted-foreground">{new Date(b.startDate).toLocaleDateString()} {b.startTime} to {new Date(b.endDate).toLocaleDateString()} {b.endTime}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </SectionList>
      </div>
    </section>
  );
};

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-surface border border-border p-4 shadow-card">
    <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

const ServiceCard = ({ icon, title, desc, cta, to }: { icon: React.ReactNode; title: string; desc: string; cta: string; to: string }) => (
  <Link to={to} className="group bg-surface border border-border p-7 shadow-card hover:border-primary transition-smooth block">
    <div className="h-12 w-12 grid place-items-center bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{desc}</p>
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary group-hover:gap-3 transition-all">{cta} <ArrowRight className="h-4 w-4" /></span>
  </Link>
);

const SectionList = ({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) => {
  const entries = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-surface border border-border p-6">{empty}</p>
      ) : (
        <div className="space-y-3">{entries}</div>
      )}
    </div>
  );
};

export default SolarDashboard;



