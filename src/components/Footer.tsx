import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="container-px py-16 grid gap-12 md:grid-cols-4">
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-9 w-9 grid place-items-center bg-red-gradient text-primary-foreground font-bold">A</span>
          <span className="font-bold text-lg">AZB <span className="text-primary">GROUP</span></span>
        </div>
        <p className="text-sm text-secondary-foreground/70 leading-relaxed">
          A multi-sector holding company powering industries and shaping the future across energy, construction, technology, real estate and investments.
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">Subsidiaries</h4>
        <ul className="space-y-3 text-sm text-secondary-foreground/75">
          <li><Link to="/subsidiaries" className="hover:text-primary transition-smooth">AZB Solar</Link></li>
          <li><Link to="/subsidiaries" className="hover:text-primary transition-smooth">AZB Construction</Link></li>
          <li><Link to="/subsidiaries" className="hover:text-primary transition-smooth">AZB Tech Innovation</Link></li>
          <li><Link to="/subsidiaries" className="hover:text-primary transition-smooth">AZB Homes & Properties</Link></li>
          <li><Link to="/subsidiaries" className="hover:text-primary transition-smooth">AZB Business Investments</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">Company</h4>
        <ul className="space-y-3 text-sm text-secondary-foreground/75">
          <li><Link to="/about" className="hover:text-primary transition-smooth">About Us</Link></li>
          <li><Link to="/gallery" className="hover:text-primary transition-smooth">Projects Gallery</Link></li>
          <li><Link to="/contact" className="hover:text-primary transition-smooth">Contact</Link></li>
          <li><a href="#" className="hover:text-primary transition-smooth">Careers</a></li>
          <li><a href="#" className="hover:text-primary transition-smooth">Press</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">Contact</h4>
        <ul className="space-y-3 text-sm text-secondary-foreground/75">
          <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />AZB Tower, Business Bay, Dubai, UAE</li>
          <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" />contact@azbgroup.com</li>
          <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />+971 4 000 0000</li>
        </ul>
        <div className="flex gap-3 mt-5">
          {[Linkedin, Twitter, Facebook].map((Icon, i) => (
            <a key={i} href="#" className="h-9 w-9 grid place-items-center border border-secondary-foreground/20 hover:border-primary hover:text-primary transition-smooth">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-secondary-foreground/10">
      <div className="container-px py-6 flex flex-col md:flex-row gap-2 justify-between text-xs text-secondary-foreground/50">
        <p>© {new Date().getFullYear()} AZB Group Holdings. All rights reserved.</p>
        <p>Powering Industries. Building the Future.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
