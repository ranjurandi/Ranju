import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, PROJECT_CATS } from "@/data/content";
import { PageHeader, GlowButton } from "@/components/fx";
import { ProjectCard } from "@/components/Cards";
import CtaBand from "@/components/CtaBand";

export default function Portfolio() {
  const [cat, setCat] = useState("all");
  useEffect(() => {
    document.title = "Portfolio | Godavari Wave Technologies";
  }, []);

  const list = cat === "all" ? PROJECTS : PROJECTS.filter((p) => p.cat === cat);

  return (
    <>
      <PageHeader
        crumb="Home / Portfolio"
        title="Our"
        highlight="Portfolio"
        eyebrow="Our Portfolio"
        desc="Ecommerce platforms, food delivery networks, bike taxi apps, admin dashboards, marketing campaigns and state-scale government systems — built end to end by Godavari Wave."
      />

      <section className="relative pb-20 pt-6 sm:pb-28" data-testid="portfolio-section">
        <div className="container-gwt">
          <div
            className="flex flex-wrap gap-2.5"
            data-testid="portfolio-filters"
            role="tablist"
            aria-label="Project categories"
          >
            {PROJECT_CATS.map((c) => {
              const isActive = cat === c.id;
              const count = c.id === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c.id).length;
              return (
                <button
                  key={c.id}
                  data-testid={`portfolio-filter-${c.id}`}
                  onClick={() => setCat(c.id)}
                  className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "border border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="portfolio-filter-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] shadow-[0_0_20px_rgba(8,123,255,0.45)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">
                    {c.label}
                    <span className="ml-2 font-mono text-[10px] opacity-70">{count}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((p) => (
                <motion.div
                  key={p.title}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectCard p={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mt-16 text-center">
            <GlowButton to="/contact" testid="portfolio-cta-button">
              Have a project like these? Let&apos;s talk
            </GlowButton>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
