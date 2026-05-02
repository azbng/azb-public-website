import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const SolarAdmin = () => {
  return (
    <section className="section-py bg-background min-h-[calc(100vh-8.5rem)]">
      <div className="container-px max-w-3xl">
        <div className="bg-surface border border-border p-8 shadow-card text-center">
          <div className="mx-auto mb-4 h-12 w-12 grid place-items-center bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Solar Review Is Managed in ERP</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Loan applications, bookings, and KYC approvals are now reviewed from the internal ERP application by super admin or solar admin users.
          </p>
          <Link
            to="/subsidiaries/solar/dashboard"
            className="inline-flex items-center justify-center h-10 px-5 text-xs font-semibold uppercase tracking-[0.15em] bg-primary text-primary-foreground hover:bg-primary-glow transition-smooth"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolarAdmin;
