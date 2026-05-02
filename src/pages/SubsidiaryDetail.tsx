import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Mail, LogIn, LayoutDashboard } from "lucide-react";
import { useSolarUser } from "@/lib/solarAuth";
import { subsidiaries, galleryItems } from "@/data/azb";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";

type SectorContent = {
  tagline: string;
  heroTitle: string;
  heroAccent: string;
  intro: string;
  highlights: string[];
  services: { t: string; d: string }[];
  stats: { end: number; suffix?: string; l: string }[];
  galleryFilter?: "Solar" | "Construction" | "Properties" | "Operations";
};

const content: Record<string, SectorContent> = {
  solar: {
    tagline: "Clean Power · Built to Last",
    heroTitle: "Powering Tomorrow with",
    heroAccent: "Sunlight",
    intro:
      "AZB Solar engineers utility-scale photovoltaic plants, commercial rooftops and hybrid systems — delivering reliable, affordable clean energy across the region.",
    highlights: [
      "Utility-scale photovoltaic plants",
      "Commercial & industrial rooftop systems",
      "Off-grid and hybrid solutions",
      "Operations, maintenance & monitoring",
    ],
    services: [
      { t: "EPC Delivery", d: "End-to-end design, procurement and construction of solar assets." },
      { t: "O&M", d: "24/7 monitoring, preventive maintenance and performance optimization." },
      { t: "C&I Rooftops", d: "Tailored rooftop systems for industry, retail and warehouses." },
      { t: "Hybrid Systems", d: "Battery storage and diesel hybridization for off-grid resilience." },
    ],
    stats: [
      { end: 250, suffix: "MW+", l: "Installed Capacity" },
      { end: 180, suffix: "+", l: "Projects Delivered" },
      { end: 99, suffix: "%", l: "Plant Uptime" },
      { end: 15, suffix: "+", l: "Years Experience" },
    ],
    galleryFilter: "Solar",
  },
  construction: {
    tagline: "Engineering Excellence · Built on Trust",
    heroTitle: "Building Landmarks that",
    heroAccent: "Define Skylines",
    intro:
      "AZB Construction delivers high-rise developments, industrial complexes and civil infrastructure — on time, on budget, with uncompromising quality.",
    highlights: [
      "High-rise & mixed-use developments",
      "Industrial complexes and warehouses",
      "Civil infrastructure & roads",
      "Turnkey EPC delivery",
    ],
    services: [
      { t: "High-Rise", d: "Mixed-use towers and complex vertical developments." },
      { t: "Industrial", d: "Factories, warehouses and logistics hubs at scale." },
      { t: "Civil Works", d: "Roads, bridges and supporting infrastructure." },
      { t: "Turnkey EPC", d: "Single-source delivery from concept to handover." },
    ],
    stats: [
      { end: 120, suffix: "+", l: "Projects Delivered" },
      { end: 4, suffix: "M m²", l: "Built Surface" },
      { end: 800, suffix: "+", l: "Skilled Workforce" },
      { end: 20, suffix: "+", l: "Years Heritage" },
    ],
    galleryFilter: "Construction",
  },
  tech: {
    tagline: "Software · AI · Cloud",
    heroTitle: "Engineering the",
    heroAccent: "Digital Future",
    intro:
      "AZB Tech Innovation builds enterprise software, AI products and cloud infrastructure — the digital backbone of modern businesses.",
    highlights: [
      "Custom enterprise software platforms",
      "AI products & data engineering",
      "Cloud architecture & DevOps",
      "Digital transformation consulting",
    ],
    services: [
      { t: "Enterprise Software", d: "Custom platforms tailored to operational needs." },
      { t: "AI & Data", d: "ML models, data pipelines and decision intelligence." },
      { t: "Cloud & DevOps", d: "Scalable, secure cloud-native architectures." },
      { t: "Consulting", d: "Strategy and execution for digital transformation." },
    ],
    stats: [
      { end: 60, suffix: "+", l: "Active Clients" },
      { end: 200, suffix: "+", l: "Engineers" },
      { end: 99, suffix: ".9%", l: "Platform SLA" },
      { end: 12, suffix: "+", l: "Industries Served" },
    ],
    galleryFilter: "Operations",
  },
  homes: {
    tagline: "Premium Living · Investment-Grade",
    heroTitle: "Homes & Spaces for",
    heroAccent: "Modern Living",
    intro:
      "AZB Homes develops, sells and manages premium residential and commercial properties — communities designed for elevated modern living.",
    highlights: [
      "Premium residential communities",
      "Commercial & retail properties",
      "Property management services",
      "Investment-grade developments",
    ],
    services: [
      { t: "Residential", d: "Luxury villas, apartments and gated communities." },
      { t: "Commercial", d: "Retail, office and mixed-use developments." },
      { t: "Management", d: "Full-service property and facility management." },
      { t: "Advisory", d: "Investment-grade real estate strategy." },
    ],
    stats: [
      { end: 35, suffix: "+", l: "Developments" },
      { end: 2500, suffix: "+", l: "Units Delivered" },
      { end: 95, suffix: "%", l: "Occupancy Rate" },
      { end: 18, suffix: "+", l: "Years in Market" },
    ],
    galleryFilter: "Properties",
  },
  investments: {
    tagline: "Capital · Advisory · Growth",
    heroTitle: "Capital that",
    heroAccent: "Builds Companies",
    intro:
      "AZB Business Investments partners with high-growth ventures and established businesses — bringing capital, governance and operational expertise.",
    highlights: [
      "Strategic equity investments",
      "Capital advisory & structuring",
      "Mergers & acquisitions support",
      "Portfolio governance & operations",
    ],
    services: [
      { t: "Equity Investment", d: "Patient capital for high-conviction opportunities." },
      { t: "Advisory", d: "Capital structuring, fundraising and growth strategy." },
      { t: "M&A", d: "End-to-end transaction support and integration." },
      { t: "Governance", d: "Board-level oversight and operational uplift." },
    ],
    stats: [
      { end: 500, suffix: "M+", l: "Capital Deployed" },
      { end: 25, suffix: "+", l: "Portfolio Companies" },
      { end: 8, suffix: "+", l: "Sectors Covered" },
      { end: 10, suffix: "+", l: "Years Investing" },
    ],
    galleryFilter: "Operations",
  },
};

const SubsidiaryDetail = () => {
  const { slug: slugParam } = useParams();
  // When mounted under the /subsidiaries/solar layout, slug is undefined → default to "solar".
  const slug = slugParam ?? "solar";
  const s = subsidiaries.find(x => x.slug === slug);
  if (!s) return <Navigate to="/subsidiaries" replace />;
  const solarUser = useSolarUser();
  const isSolar = s.slug === "solar";

  const c = content[s.slug];
  const idx = subsidiaries.findIndex(x => x.slug === s.slug);
  const next = subsidiaries[(idx + 1) % subsidiaries.length];
  const gallery = c.galleryFilter
    ? galleryItems.filter(g => g.category === c.galleryFilter).slice(0, 3)
    : galleryItems.slice(0, 3);

  return (
    <>
      {/* HERO — landing-style */}
      <section className="relative min-h-screen flex items-center bg-hero overflow-hidden">
        <img src={s.image} alt={s.name} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/60 to-black/85" />
        <div className="absolute inset-0 bg-grid mask-radial opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,hsl(var(--primary)/0.45),transparent_60%)]" />
        <div className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl animate-float" />
        <div className="pointer-events-none absolute bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container-px relative z-10 pt-32 pb-24 text-white max-w-5xl animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 grid place-items-center glass-dark p-2 shrink-0">
              <img src={s.logo} alt={`${s.name} logo`} className="h-full w-full object-contain" />
            </div>
            <p className="eyebrow">{c.tagline}</p>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] text-balance mb-8">
            {c.heroTitle}<br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent drop-shadow-[0_2px_30px_hsl(var(--primary)/0.55)]">
                {c.heroAccent}
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/75 max-w-2xl mb-10 leading-relaxed">{c.intro}</p>

          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="group relative inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">Start a Project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-primary-glow to-accent" />
            </Link>
            {isSolar && (
              solarUser ? (
                <Link to="/subsidiaries/solar/dashboard" className="inline-flex items-center gap-2 glass-dark hover:border-accent text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth">
                  <LayoutDashboard className="h-4 w-4" /> My Dashboard
                </Link>
              ) : (
                <Link to="/subsidiaries/solar/auth" className="inline-flex items-center gap-2 glass-dark hover:border-accent text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth">
                  <LogIn className="h-4 w-4" /> Sign In / Sign Up
                </Link>
              )
            )}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 border-t border-accent/20 bg-black/50 backdrop-blur-md">
          <div className="container-px grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {c.stats.map(st => (
              <div key={st.l} className="py-6 text-white text-center md:text-left md:px-8 first:pl-0 group">
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold">
                  <Counter end={st.end} suffix={st.suffix ?? ""} />
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 mt-1 group-hover:text-accent transition-smooth">{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="section-py bg-background">
        <div className="container-px grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="right" className="relative aspect-[4/3] overflow-hidden shadow-elegant">
            <img src={s.image} alt={s.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </Reveal>
          <Reveal direction="left" delay={150}>
            <p className="eyebrow mb-4">About {s.name}</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">A trusted operator in {s.sector.toLowerCase()}.</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">{s.description}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              As part of the AZB Group, {s.name} draws on shared engineering excellence, capital strength and disciplined governance — delivering outcomes that scale.
            </p>
            <ul className="space-y-3">
              {c.highlights.map(h => (
                <li key={h} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/85">{h}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-py bg-surface">
        <div className="container-px">
          <Reveal className="max-w-2xl mb-14">
            <p className="eyebrow mb-4">What we do</p>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Capabilities tuned for outcomes.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.services.map((sv, i) => (
              <Reveal key={sv.t} delay={i * 80}>
                <div className="h-full bg-background border border-border p-8 hover:border-primary transition-smooth shadow-card group">
                  <div className="h-1 w-10 bg-primary mb-6 group-hover:w-16 transition-all" />
                  <h3 className="text-xl font-bold mb-3">{sv.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sv.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      {gallery.length > 0 && (
        <section className="section-py bg-background">
          <div className="container-px">
            <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="eyebrow mb-4">Selected work</p>
                <h2 className="text-4xl md:text-5xl font-bold">Recent projects.</h2>
              </div>
              <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary hover:text-primary-glow transition-smooth">
                View full gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {gallery.map((g, i) => (
                <Reveal key={g.title} delay={i * 100}>
                  <div className="relative aspect-[4/3] overflow-hidden shadow-card group">
                    <img src={g.src} alt={g.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-accent mb-1">{g.category}</p>
                      <p className="font-semibold">{g.title}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-redgold-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0_0%_100%/0.18),transparent_60%)]" />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-float" />
        <div className="container-px relative py-24 md:py-32 text-center text-primary-foreground">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-6">
            <span className="h-px w-8 bg-accent" /> Partner with {s.name} <span className="h-px w-8 bg-accent" />
          </p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Let's <span className="text-gradient-gold">Build Together</span>
          </h2>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto mb-10 text-lg">
            Speak with the {s.name} team about partnerships, tenders or service inquiries.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="group inline-flex items-center gap-2 bg-white text-secondary hover:bg-accent hover:text-secondary px-10 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth shadow-gold">
              <Mail className="h-4 w-4" /> Contact Us
            </Link>
            <Link to={next.url} className="inline-flex items-center gap-2 border border-white/40 hover:border-accent text-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth">
              Next: {next.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default SubsidiaryDetail;
