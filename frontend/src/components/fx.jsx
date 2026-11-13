import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, y = 30, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = "", gap = 0.09 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 34, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, highlight, desc, align = "left" }) {
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start";
  return (
    <div className={`flex max-w-2xl flex-col ${alignCls}`}>
      {eyebrow && (
        <Reveal>
          <span className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-[#087BFF] to-[#00C8FF]" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className="mt-4 font-display text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[44px]">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h2>
      </Reveal>
      {desc && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed text-slate-400">{desc}</p>
        </Reveal>
      )}
    </div>
  );
}

export function Counter({ to, suffix = "", className = "", duration = 2.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function PageHeader({ eyebrow, title, highlight, desc, crumb }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-40 sm:pb-20 sm:pt-48">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[#087BFF]/20 blur-[140px]" />
        <div className="absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,#000,transparent)]" />
      </div>
      <div className="container-gwt relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[#00C8FF]"
        >
          <span data-testid="page-breadcrumb">{crumb}</span>
        </motion.div>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            >
              {title} {highlight && <span className="text-gradient">{highlight}</span>}
            </motion.span>
          </span>
        </h1>
        {desc && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            {desc}
          </motion.p>
        )}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="eyebrow mt-2"
        >
          {eyebrow}
        </motion.span>
      </div>
    </section>
  );
}

export function BackdropFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#050B16]">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000,transparent)]" />
      <div className="absolute -top-32 left-[8%] h-[420px] w-[420px] rounded-full bg-[#087BFF]/14 blur-[130px]" />
      <div className="absolute right-[4%] top-[30%] h-[360px] w-[360px] rounded-full bg-[#00C8FF]/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[420px] w-[520px] rounded-full bg-[#087BFF]/10 blur-[150px]" />
      <div className="noise-overlay absolute inset-0" />
    </div>
  );
}

export function GlowButton({ to, href, children, variant = "primary", testid, className = "" }) {
  const cls =
    variant === "primary"
      ? "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(8,123,255,0.4)] transition-all duration-300 hover:shadow-[0_0_44px_rgba(0,200,255,0.55)] hover:-translate-y-0.5"
      : "group inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-cyan-300/70 hover:bg-cyan-400/10 hover:-translate-y-0.5";
  const inner = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
    </>
  );
  if (href)
    return (
      <a href={href} data-testid={testid} className={`${cls} ${className}`}>
        {inner}
      </a>
    );
  return (
    <Link to={to} data-testid={testid} className={`${cls} ${className}`}>
      {inner}
    </Link>
  );
}
