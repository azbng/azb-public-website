import { subsidiaries } from "@/data/azb";
import SubsidiaryCard from "@/components/SubsidiaryCard";
import Reveal from "@/components/Reveal";

const Subsidiaries = () => (
  <>
    <section className="relative pt-40 pb-24 bg-hero overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,hsl(var(--primary)/0.3),transparent_60%)]" />
      <div className="container-px relative text-white max-w-4xl">
        <p className="eyebrow text-primary-glow mb-4">Our Subsidiaries</p>
        <h1 className="text-5xl md:text-7xl font-bold text-balance">Five operating companies. One group standard.</h1>
        <p className="text-white/70 mt-6 max-w-2xl text-lg">
          Click any card to visit the subsidiary website.
        </p>
      </div>
    </section>

    <section className="section-py bg-background">
      <div className="container-px">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {subsidiaries.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <SubsidiaryCard s={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Subsidiaries;
