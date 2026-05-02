import ceo from "@/assets/team-ceo.jpg";
import coo from "@/assets/team-coo.jpg";
import cfo from "@/assets/team-cfo.jpg";
import cto from "@/assets/team-cto.jpg";
import ops from "@/assets/team-ops.jpg";
import inv from "@/assets/team-inv.jpg";
import { Linkedin, Mail } from "lucide-react";

type Member = { name: string; role: string; bio: string; img: string; lead?: boolean };

const leader: Member = {
  name: "Adebayo Z. Bello",
  role: "Founder & Group Chairman",
  bio: "Two decades leading multi-sector growth across energy, infrastructure and capital markets. Sets the long-term vision and governance for AZB Group.",
  img: ceo,
  lead: true,
};

const members: Member[] = [
  { name: "Amara Okonkwo", role: "Group Chief Operating Officer", bio: "Drives operational standards across all five subsidiaries.", img: coo },
  { name: "Kwame Mensah", role: "Group Chief Financial Officer", bio: "Oversees capital allocation, treasury and group reporting.", img: cfo },
  { name: "Zanele Dlamini", role: "Chief Technology Officer", bio: "Leads AZB Tech Innovation and group-wide digital strategy.", img: cto },
  { name: "Tunde Adeyemi", role: "Director of Operations", bio: "Heads delivery for construction and energy portfolios.", img: ops },
  { name: "Nia Achieng", role: "Head of Investments", bio: "Leads strategic investments and partnership ventures.", img: inv },
];

const Card = ({ m }: { m: Member }) => (
  <div className={`group relative overflow-hidden bg-card shadow-card hover-lift hover:shadow-elegant ${m.lead ? "md:col-span-2 md:row-span-2" : ""}`}>
    <div className={`relative overflow-hidden ${m.lead ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[4/5]"}`}>
      <img src={m.img} alt={m.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-smooth duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute top-0 left-0 h-12 w-12 border-t-2 border-l-2 border-accent opacity-0 group-hover:opacity-100 transition-smooth" />
      <div className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-r-2 border-accent opacity-0 group-hover:opacity-100 transition-smooth" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent mb-2">{m.lead ? "Leadership" : "Executive"}</p>
        <h3 className={`font-bold ${m.lead ? "text-3xl md:text-4xl" : "text-xl"}`}>{m.name}</h3>
        <p className="text-sm text-white/80 mt-1">{m.role}</p>
        {m.lead && <p className="text-sm text-white/70 mt-4 max-w-md leading-relaxed">{m.bio}</p>}

        <div className="flex items-center gap-2 mt-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-smooth">
          <a href="#" aria-label="LinkedIn" className="h-8 w-8 grid place-items-center glass-dark hover:bg-accent hover:text-secondary transition-smooth">
            <Linkedin className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="Email" className="h-8 w-8 grid place-items-center glass-dark hover:bg-accent hover:text-secondary transition-smooth">
            <Mail className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Team = () => (
  <section className="section-py bg-surface relative overflow-hidden">
    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
    <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

    <div className="container-px relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="eyebrow justify-center mb-5">Leadership</p>
        <h2 className="text-4xl md:text-5xl font-bold mb-5 text-balance">
          Led by operators with <span className="text-gradient-gold">decades of experience</span>.
        </h2>
        <p className="text-muted-foreground">The people setting strategy and standards across AZB Group.</p>
        <div className="mx-auto mt-6 gold-divider" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-fr">
        <Card m={leader} />
        {members.map(m => <Card key={m.name} m={m} />)}
      </div>
    </div>
  </section>
);

export default Team;
