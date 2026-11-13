import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Users, Megaphone, Nfc, CheckCircle2 } from "lucide-react";
import { Counter } from "@/components/fx";

const EASE = [0.16, 1, 0.3, 1];
const BARS = [42, 65, 38, 78, 55, 88, 70];

function Chip({ className = "", delay = 0, icon, children, testid }) {
  return (
    <motion.div
      data-testid={testid}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={`absolute z-20 hidden md:block ${className}`}
    >
      <div className="animate-float-y-slow flex items-center gap-2.5 rounded-2xl border border-cyan-400/25 bg-[#071426]/85 px-4 py-3 shadow-[0_16px_40px_rgba(2,8,20,0.7),0_0_24px_rgba(0,200,255,0.15)] backdrop-blur-xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#087BFF]/30 to-[#00C8FF]/20 text-[#00C8FF]">
          {icon}
        </span>
        <span className="text-sm font-semibold text-white">{children}</span>
      </div>
    </motion.div>
  );
}

export default function HeroMockup() {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, 1]), { stiffness: 55, damping: 15 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 55, damping: 15 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      data-testid="hero-mockup"
      className="relative [perspective:1400px]"
    >
      <div className="pointer-events-none absolute -inset-12 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[72%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#087BFF]/30 blur-[100px]" />
        <div className="animate-spin-slower absolute left-1/2 top-1/2 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-400/15" />
      </div>

      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#071426]/92 shadow-[0_40px_90px_rgba(2,8,20,0.85),0_0_60px_rgba(8,123,255,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-4 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 font-mono text-[10px] tracking-wider text-slate-400">
              godavariwave.com — mission control
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-emerald-300">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
            </span>
          </div>

          <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[150px_1fr]">
            <div className="hidden flex-col gap-3 border-r border-white/10 p-3 sm:flex">
              {["Overview", "Projects", "Marketing", "CRM", "Cloud", "AI Suite"].map((m, i) => (
                <div
                  key={m}
                  className={`rounded-lg px-3 py-2 text-[11px] font-medium ${
                    i === 0 ? "bg-[#087BFF]/20 text-cyan-200" : "text-slate-500"
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { to: 480, suffix: "+", label: "Projects Delivered" },
                  { to: 353, suffix: "+", label: "Marketing Clients" },
                  { to: 4, suffix: "", label: "Branches" },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <p className="font-display text-lg font-bold text-white sm:text-2xl">
                      <Counter to={k.to} suffix={k.suffix} duration={2.6} />
                    </p>
                    <p className="mt-0.5 truncate text-[9px] uppercase tracking-widest text-slate-500 sm:text-[10px]">
                      {k.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-end justify-between gap-1.5" style={{ height: 96 }}>
                    {BARS.map((h, i) => (
                      <motion.span
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1.1, delay: 0.9 + i * 0.09, ease: EASE }}
                        className="w-full rounded-t-md bg-gradient-to-t from-[#087BFF]/50 to-[#00C8FF]"
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                    Weekly delivery velocity
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <svg viewBox="0 0 120 60" className="h-24 w-full">
                    <motion.path
                      d="M2 50 L20 42 L38 46 L56 28 L74 32 L92 14 L118 8"
                      fill="none"
                      stroke="url(#sparkgrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.8, delay: 1.2, ease: "easeInOut" }}
                    />
                    <defs>
                      <linearGradient id="sparkgrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#087BFF" />
                        <stop offset="1" stopColor="#00C8FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                    Growth index
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {["Website & portal deployment", "Digital marketing campaign", "NFC card provisioning"].map((r, i) => (
                  <motion.div
                    key={r}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + i * 0.14, duration: 0.6, ease: EASE }}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00C8FF]" /> {r}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <Chip testid="hero-chip-clients" className="-left-10 top-8" delay={1.1} icon={<Users className="h-4 w-4" />}>
        480+ Trusted Clients
      </Chip>
      <Chip testid="hero-chip-marketing" className="-right-12 top-1/3" delay={1.25} icon={<Megaphone className="h-4 w-4" />}>
        353+ Marketing Clients
      </Chip>
      <Chip testid="hero-chip-nfc" className="-left-14 bottom-20" delay={1.4} icon={<Nfc className="h-4 w-4" />}>
        NFC Digital Cards
      </Chip>
    </div>
  );
}
