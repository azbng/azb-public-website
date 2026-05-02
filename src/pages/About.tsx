import about from "@/assets/about.jpg";
import hero from "@/assets/hero.jpg";
import Team from "@/components/Team";

const values = [
  { t: "Multi-Sector Strength", d: "Five operating subsidiaries with deep specialism, sharing capital, governance and group standards." },
  { t: "Vision for Growth", d: "Patient capital allocated where compounding is real — energy, infrastructure, real estate, and technology." },
  { t: "Reliability", d: "Two decades of delivery. Clear contracts, clear timelines, clear results." },
  { t: "Operational Excellence", d: "Standards, audits and continuous improvement across every site and every team." },
];

const About = () => (
  <>
    <section className="relative pt-40 pb-28 bg-hero overflow-hidden">
      <img src={hero} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(43_80%_46%/0.18),transparent_60%)]" />
      <div className="container-px relative text-white max-w-4xl animate-fade-in-up">
        <p className="eyebrow mb-5">About Us</p>
        <h1 className="text-5xl md:text-7xl font-bold text-balance">
          A holding company built for the <span className="text-gradient-gold">long term</span>.
        </h1>
      </div>
    </section>

    <section className="section-py bg-background">
      <div className="container-px grid lg:grid-cols-2 gap-16 items-start">
        <div className="relative lg:sticky lg:top-28">
          <div className="absolute -top-4 -left-4 h-24 w-24 border-t-2 border-l-2 border-accent" />
          <div className="absolute -bottom-4 -right-4 h-24 w-24 border-b-2 border-r-2 border-primary" />
          <div className="relative aspect-[4/5] overflow-hidden shadow-elegant">
            <img src={about} alt="AZB Group" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-5">Who We Are</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
            Operating across the industries that <span className="text-gradient-gold">build the real economy</span>.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            AZB Group is a multi-sector holding company with active operations across renewable energy, construction, technology, real estate and capital investments. We own and operate businesses we understand — for the long term.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Our model is simple: back exceptional operators in essential industries, give them the capital and governance to scale, and hold them to uncompromising standards of delivery.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(v => (
              <div key={v.t} className="group glass p-5 hover-lift hover:border-accent transition-smooth">
                <div className="h-px w-10 bg-accent mb-3 group-hover:w-16 transition-all duration-500" />
                <h3 className="font-semibold mb-2">{v.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <Team />
  </>
);

export default About;
