import Gallery from "@/components/Gallery";

const GalleryPage = () => (
  <>
    <section className="relative pt-40 pb-24 bg-hero overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(var(--primary)/0.3),transparent_60%)]" />
      <div className="container-px relative text-white max-w-4xl">
        <p className="eyebrow text-primary-glow mb-4">Gallery</p>
        <h1 className="text-5xl md:text-7xl font-bold text-balance">Projects & Operations.</h1>
        <p className="text-white/70 mt-6 max-w-2xl text-lg">A look at the sites, teams and developments behind AZB Group.</p>
      </div>
    </section>
    <section className="section-py bg-background">
      <div className="container-px"><Gallery /></div>
    </section>
  </>
);

export default GalleryPage;
