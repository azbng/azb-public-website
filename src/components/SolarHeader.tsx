import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, LayoutDashboard, Menu, X, ShieldCheck, Moon, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { solarAuth, useSolarUser } from "@/lib/solarAuth";
import { useTheme } from "@/components/ThemeProvider";
import logoSolar from "@/assets/logo-solar.png";

const SolarHeader = () => {
  const user = useSolarUser();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const links = useMemo(() => {
    const base = [{ to: "/subsidiaries/solar", label: "Overview", end: true }];
    if (!user) return base;
    return [
      ...base,
      { to: "/subsidiaries/solar/loan", label: "Solar Loan" },
      { to: "/subsidiaries/solar/booking", label: "Energy Booking" },
    ];
  }, [user]);

  const signOut = async () => {
    await solarAuth.signOut();
    navigate("/subsidiaries/solar");
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-px flex items-center justify-between h-14">
        <Link to="/subsidiaries/solar" className="flex items-center gap-2 text-sm font-semibold">
          <img src={logoSolar} alt="AZB Solar" className="h-7 w-7 object-contain" />
          <span className="hidden sm:inline">AZB Solar</span>
          <span className="text-muted-foreground hidden sm:inline">-</span>
          <span className="text-muted-foreground hidden sm:inline">Client Portal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "text-xs font-semibold uppercase tracking-[0.15em] transition-smooth",
                  isActive ? "text-primary" : "text-foreground/70 hover:text-foreground",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              to="/subsidiaries/solar/dashboard"
              className={({ isActive }) =>
                cn(
                  "text-xs font-semibold uppercase tracking-[0.15em] flex items-center gap-1.5 transition-smooth",
                  isActive ? "text-primary" : "text-foreground/70 hover:text-foreground",
                )
              }
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </NavLink>
          ) : null}
          {user?.role === "admin" ? (
            <NavLink
              to="/subsidiaries/solar/admin"
              className={({ isActive }) =>
                cn(
                  "text-xs font-semibold uppercase tracking-[0.15em] flex items-center gap-1.5 transition-smooth",
                  isActive ? "text-primary" : "text-foreground/70 hover:text-foreground",
                )
              }
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center border border-border hover:border-primary text-foreground/80 transition-smooth"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                {user.fullName} {user.role === "admin" ? <span className="ml-1 text-primary">(admin)</span> : null}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold uppercase tracking-[0.15em] border border-border hover:border-primary text-foreground/80 transition-smooth"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/subsidiaries/solar/auth"
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold uppercase tracking-[0.15em] bg-primary hover:bg-primary-glow text-primary-foreground transition-smooth shadow-elegant"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Link>
          )}
          <button onClick={() => setOpen((o) => !o)} className="md:hidden h-9 w-9 grid place-items-center border border-border" aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-border">
          <nav className="container-px py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn("py-2 text-sm font-medium", isActive ? "text-primary" : "text-foreground/80")}
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <NavLink
                to="/subsidiaries/solar/dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn("py-2 text-sm font-medium", isActive ? "text-primary" : "text-foreground/80")}
              >
                Dashboard
              </NavLink>
            ) : null}
            {user?.role === "admin" ? (
              <NavLink
                to="/subsidiaries/solar/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn("py-2 text-sm font-medium", isActive ? "text-primary" : "text-foreground/80")}
              >
                Admin
              </NavLink>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
};

export default SolarHeader;
