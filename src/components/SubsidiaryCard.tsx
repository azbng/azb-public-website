import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Subsidiary } from "@/data/azb";

const SubsidiaryCard = ({ s }: { s: Subsidiary; large?: boolean }) => (
  <Link
    to={s.url}
    className="group relative block overflow-hidden bg-surface border border-border shadow-card hover-lift hover:shadow-elegant hover:border-primary/40 transition-smooth"
  >
    {/* Photo */}
    <div className="relative aspect-[16/10] overflow-hidden">
      <img
        src={s.image}
        alt={s.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-smooth duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/25 transition-smooth" />

      {/* Sector tag */}
      <span className="absolute top-4 left-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">
        <span className="h-px w-6 bg-accent" />{s.sector}
      </span>

      {/* External arrow */}
      <span className="absolute top-4 right-4 h-10 w-10 grid place-items-center glass-dark transition-smooth group-hover:bg-accent group-hover:text-secondary group-hover:border-accent">
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
      </span>

      {/* Big logo - center */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-32 w-32 md:h-40 md:w-40 grid place-items-center glass-dark p-5 rounded-sm transition-smooth duration-500 group-hover:scale-110 group-hover:border-accent">
          <img
            src={s.logo}
            alt={`${s.name} logo`}
            loading="lazy"
            className="h-full w-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.7)]"
          />
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="p-6 md:p-7">
      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-smooth">{s.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.short}</p>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Learn More <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </div>
  </Link>
);

export default SubsidiaryCard;
