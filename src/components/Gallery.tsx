import { useState } from "react";
import { galleryItems } from "@/data/azb";
import { cn } from "@/lib/utils";

const filters = ["All", "Solar", "Construction", "Properties", "Operations"] as const;

const Gallery = ({ limit }: { limit?: number }) => {
  const [active, setActive] = useState<typeof filters[number]>("All");
  const items = (active === "All" ? galleryItems : galleryItems.filter(i => i.category === active)).slice(0, limit);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] border transition-smooth",
              active === f
                ? "bg-primary text-primary-foreground border-primary shadow-gold"
                : "border-border text-foreground/70 hover:border-accent hover:text-accent"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, i) => (
          <figure key={`${item.src}-${i}`} className="group relative aspect-square overflow-hidden bg-muted shadow-card hover-lift hover:shadow-elegant">
            <img
              src={item.src}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-smooth duration-700 group-hover:scale-125"
            />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/25 transition-smooth" />
            <div className="pointer-events-none absolute inset-3 border border-accent opacity-0 group-hover:opacity-100 transition-smooth" />
            <figcaption className="absolute inset-0 flex items-end p-5 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth">
              <div className="text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">{item.category}</p>
                <p className="text-sm font-semibold">{item.title}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
