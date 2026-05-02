import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message received. AZB Group will be in touch shortly.");
    setForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <>
      <section className="relative pt-40 pb-24 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,hsl(var(--primary)/0.3),transparent_60%)]" />
        <div className="container-px relative text-white max-w-4xl">
          <p className="eyebrow text-primary-glow mb-4">Contact</p>
          <h1 className="text-5xl md:text-7xl font-bold text-balance">Let's start a conversation.</h1>
        </div>
      </section>

      <section className="section-py bg-background">
        <div className="container-px grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {[
              { Icon: MapPin, t: "Headquarters", d: "AZB Tower, Business Bay\nDubai, United Arab Emirates" },
              { Icon: Mail, t: "Email", d: "contact@azbgroup.com\npress@azbgroup.com" },
              { Icon: Phone, t: "Phone", d: "+971 4 000 0000\n+971 50 000 0000" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex gap-5">
                <div className="h-12 w-12 grid place-items-center bg-primary text-primary-foreground shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="lg:col-span-3 bg-surface p-8 md:p-10 shadow-card space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70 mb-2 block">Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-smooth" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70 mb-2 block">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-smooth" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70 mb-2 block">Company</label>
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-smooth" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70 mb-2 block">Message</label>
              <textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-smooth resize-none" />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth">
              Send Message <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="pb-24 bg-background">
        <div className="container-px">
          <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="eyebrow mb-3">Find Us</p>
              <h2 className="text-3xl md:text-4xl font-bold">AZB Tower, Business Bay — Dubai</h2>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Business+Bay+Dubai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary hover:text-accent transition-smooth"
            >
              Get Directions <MapPin className="h-4 w-4" />
            </a>
          </div>
          <div className="relative overflow-hidden shadow-elegant border border-border group">
            <div className="absolute inset-0 pointer-events-none ring-1 ring-accent/0 group-hover:ring-accent/40 transition-smooth z-10" />
            <iframe
              title="AZB Group Headquarters Location"
              src="https://www.google.com/maps?q=Business+Bay,+Dubai,+UAE&output=embed"
              width="100%"
              height="500"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full block grayscale-[30%] contrast-[1.05] group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
