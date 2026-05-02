import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";
import { subsidiaries } from "@/data/azb";
import SubsidiaryCard from "@/components/SubsidiaryCard";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";

const stats = [
  { end: 5, suffix: "", l: "Operating Sectors" },
  { end: 20, suffix: "+", l: "Years of Heritage" },
  { end: 1200, suffix: "+", l: "Team Members" },
  { end: 150, suffix: "+", l: "Delivered Projects" },
];

const Index = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-hero overflow-hidden">
        <img src={hero} alt="AZB Group operations" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-grid mask-radial opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,hsl(var(--primary)/0.45),transparent_60%)]" />
        <div className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl animate-float" />
        <div className="pointer-events-none absolute bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container-px relative z-10 pt-32 pb-24 text-white max-w-5xl animate-fade-in-up">
          <p className="eyebrow mb-6">AZB Group · Holding Company</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] text-balance mb-8">
            Powering Industries.<br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent drop-shadow-[0_2px_30px_hsl(var(--primary)/0.55)]">
                Building the Future.
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mb-10 leading-relaxed">
            AZB Group operates across energy, construction, technology, real estate, and investments — delivering durable value through scale, expertise and integrity.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/subsidiaries" className="group relative inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">Explore Subsidiaries <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-gradient-to-r from-primary-glow to-accent" />
            </Link>
            <Link to="/gallery" className="inline-flex items-center gap-2 glass-dark hover:border-accent text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth">
              View Projects
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 border-t border-accent/20 bg-black/50 backdrop-blur-md">
          <div className="container-px grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map(s => (
              <div key={s.l} className="py-6 text-white text-center md:text-left md:px-8 first:pl-0 group">
                <div className="text-3xl md:text-4xl font-bold text-gradient-gold">
                  <Counter end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 mt-1 group-hover:text-accent transition-smooth">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBSIDIARIES */}
      <section id="subsidiaries" className="section-py bg-background scroll-mt-24">
        <div className="container-px">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Our Subsidiaries</p>
              <h2 className="text-4xl md:text-5xl font-bold text-balance">Five sectors. One disciplined operator.</h2>
            </div>
            <p className="text-muted-foreground max-w-md">
              Each subsidiary is run by specialists, backed by group capital and shared standards of governance. Click any card to visit.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {subsidiaries.map((s, i) => (
              <Reveal key={s.slug} delay={i * 100}>
                <SubsidiaryCard s={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="section-py bg-surface">
        <div className="container-px grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="right" className="relative aspect-[4/3] overflow-hidden shadow-elegant">
            <img src={about} alt="AZB Group skyline" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </Reveal>
          <Reveal direction="left" delay={150}>
            <p className="eyebrow mb-4">About AZB Group</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">A holding company built on operational excellence.</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              AZB Group is a multi-sector holding company with operations spanning renewable energy, construction, technology, real estate and investments. We invest patient capital in industries that build the real economy.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our strength is reliability — clear governance, long-term partnerships, and a relentless focus on delivery.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { t: "Multi-sector", d: "Diversified by design" },
                { t: "Growth", d: "Long-term vision" },
                { t: "Reliability", d: "Trusted delivery" },
              ].map(b => (
                <div key={b.t} className="border-l-2 border-primary pl-4">
                  <div className="font-semibold">{b.t}</div>
                  <div className="text-xs text-muted-foreground mt-1">{b.d}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA wrapper end fix */}

      {/* GALLERY removed from home — see /gallery page */}

      {/* CTA */}
      <section className="bg-redgold-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0_0%_100%/0.18),transparent_60%)]" />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-float" />
        <div className="container-px relative py-24 md:py-32 text-center text-primary-foreground">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-6">
            <span className="h-px w-8 bg-accent" /> Get in Touch <span className="h-px w-8 bg-accent" />
          </p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Let's <span className="text-gradient-gold">Build the Future</span> Together
          </h2>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto mb-10 text-lg">
            Partner with AZB Group on your next project — from energy infrastructure to landmark developments.
          </p>
          <Link to="/contact" className="group inline-flex items-center gap-2 bg-white text-secondary hover:bg-accent hover:text-secondary px-10 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth shadow-gold">
            Contact AZB Group <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Index;
