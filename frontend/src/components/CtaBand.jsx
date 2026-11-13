import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE, BRANCHES } from "@/data/content";
import { Reveal, GlowButton } from "@/components/fx";

const STEPS = [
  "Share your requirements",
  "Discuss them with our experts",
  "Get a free quote",
  "Start the project",
];

export default function CtaBand() {
  const HYDERABAD = BRANCHES.find(b => b.city === "Hyderabad");
  return (
    <section className="relative py-16 sm:py-24" data-testid="cta-band">
      <div className="container-gwt">
        <Reveal>
          <div className="noise-overlay relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#071426] via-[#050B16] to-[#071426] p-7 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#087BFF]/25 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#00C8FF]/20 blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="eyebrow">You Are Here</span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Let&apos;s Start{" "}
                  <span className="text-gradient">Initiating Your Journey to Success and Growth.</span>
                </h2>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {STEPS.map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <span className="font-mono text-xs text-[#00C8FF]">0{i + 1}</span>
                      <span className="text-sm text-slate-300">{s}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#050B16]/60 p-7 backdrop-blur-xl sm:p-9">
                <h3 className="font-display text-2xl font-bold text-white">Let&apos;s Connect!</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Our Hyderabad Office is based at Meenakshi Tech Park, Gachibowli.
                  Send us a message, and we&apos;ll promptly discuss your project.
                </p>
                <ul className="mt-6 space-y-4 text-sm text-slate-300">
                  <li>
                    <a
                      data-testid="cta-phone-link"
                      href={`tel:${HYDERABAD.phones[0].replace(/\s/g, "")}`}
                      className="flex items-center gap-3 transition-colors duration-300 hover:text-cyan-300"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-[#087BFF]/15 text-[#00C8FF]">
                        <Phone className="h-4 w-4" />
                      </span>
                      {HYDERABAD.phones[0]}
                    </a>
                  </li>
                  <li>
                    <a
                      data-testid="cta-email-link"
                      href={`mailto:${SITE.emailInfo}`}
                      className="flex items-center gap-3 transition-colors duration-300 hover:text-cyan-300"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-[#087BFF]/15 text-[#00C8FF]">
                        <Mail className="h-4 w-4" />
                      </span>
                      {SITE.emailInfo}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-[#087BFF]/15 text-[#00C8FF]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span>{HYDERABAD.address}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-[#087BFF]/15 text-[#00C8FF]">
                      <Clock className="h-4 w-4" />
                    </span>
                    <span>Monday-Friday: 9:30 AM-6:30 PM · Saturday and Sunday: Closed</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <GlowButton to="/contact" testid="cta-send-request-button">
                    Send Request
                  </GlowButton>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
