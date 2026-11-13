import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ArrowUpRight } from "lucide-react";
import { SITE } from "@/data/content";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/career", label: "Career" },
  { to: "/contact", label: "Contact" },
];

export function Logo({ compact = false }) {
  return (
    <Link to="/" data-testid="nav-logo-link" className="group flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center">
        <img
          src="/assests/images/gwt.png"
          alt="Godavari Wave Technologies logo"
          className="h-10 w-10 object-contain"
        />
        <span className="absolute inset-0 -z-10 rounded-full bg-[#087BFF]/30 blur-lg transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[15px] font-bold tracking-wide text-white">
            GODAVARI WAVE
          </span>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.42em] text-[#00C8FF]">
            Technologies
          </span>
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      data-testid="navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "border-b border-cyan-500/10 bg-[#050B16]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-gwt flex h-[76px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" data-testid="nav-links-desktop">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-400 hover:text-cyan-300"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-cyan-400/25 bg-[#087BFF]/15"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${SITE.phonePrimary}`}
            data-testid="nav-phone-link"
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors duration-300 hover:border-cyan-400/50 hover:text-cyan-300"
          >
            <Phone className="h-4 w-4 text-[#00C8FF]" />
            {SITE.phonePrimary}
          </a>
          <Link
            to="/contact"
            data-testid="nav-cta-button"
            className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(8,123,255,0.35)] transition-all duration-300 hover:shadow-[0_0_38px_rgba(0,200,255,0.5)]"
          >
            Get Free Consultation
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="nav-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-cyan-500/10 bg-[#050B16]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-gwt flex flex-col gap-1 py-6">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.35 }}
                >
                  <NavLink
                    to={l.to}
                    data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-2xl font-semibold ${
                        isActive ? "bg-[#087BFF]/15 text-white" : "text-slate-300"
                      }`
                    }
                  >
                    {l.label}
                    <ArrowUpRight className="h-5 w-5 text-[#00C8FF]" />
                  </NavLink>
                </motion.div>
              ))}
              <a
                href={`tel:${SITE.phonePrimary}`}
                data-testid="nav-mobile-phone-link"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-5 py-3.5 font-semibold text-white"
              >
                <Phone className="h-4 w-4" /> {SITE.phonePrimary}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
