import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/logo-azb.png";

type LinkItem = { to: string; label: string; scrollTo?: string };
const links: LinkItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/", label: "Subsidiaries", scrollTo: "subsidiaries" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHome = location.pathname === "/";
  const transparent = onHome && !scrolled && !open;

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-smooth",
      transparent ? "bg-transparent" : "bg-background/85 backdrop-blur-md border-b border-border"
    )}>
      <div className="container-px flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={brandLogo}
            alt="AZB Group"
            className={cn(
              "h-9 md:h-10 w-auto object-contain transition-smooth group-hover:scale-[1.03]",
              transparent && "[filter:brightness(0)_invert(1)]"
            )}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => l.scrollTo ? (
            <a
              key={l.label}
              href={`/#${l.scrollTo}`}
              onClick={(e) => handleScrollTo(e, l.scrollTo!)}
              className={cn(
                "text-sm font-medium tracking-wide relative py-1 transition-smooth cursor-pointer",
                transparent ? "text-white/85 hover:text-white" : "text-foreground/75 hover:text-foreground"
              )}
            >
              {l.label}
            </a>
          ) : (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => cn(
                "text-sm font-medium tracking-wide relative py-1 transition-smooth",
                transparent ? "text-white/85 hover:text-white" : "text-foreground/75 hover:text-foreground",
                isActive && "text-primary",
                isActive && "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary"
              )}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full border transition-smooth hover:border-primary",
              transparent ? "border-white/30 text-white" : "border-border text-foreground"
            )}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            className={cn(
              "md:hidden h-10 w-10 grid place-items-center rounded-full border",
              transparent ? "border-white/30 text-white" : "border-border text-foreground"
            )}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-px py-4 flex flex-col gap-1">
            {links.map(l => l.scrollTo ? (
              <a
                key={l.label}
                href={`/#${l.scrollTo}`}
                onClick={(e) => handleScrollTo(e, l.scrollTo!)}
                className="py-3 text-sm font-medium text-foreground/80"
              >
                {l.label}
              </a>
            ) : (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => cn(
                  "py-3 text-sm font-medium",
                  isActive ? "text-primary" : "text-foreground/80"
                )}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
