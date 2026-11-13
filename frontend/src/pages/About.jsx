import { useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Target, Globe2, GraduationCap, Lightbulb, UserCheck, Handshake } from "lucide-react";
import { ABOUT, FLEX_SERVICES, BRANCHES, TRAINING, SITE } from "@/data/content";
import { Reveal, Stagger, StaggerItem, SectionHeading, Counter, PageHeader, GlowButton } from "@/components/fx";
import { BranchCard } from "@/components/Cards";
import CtaBand from "@/components/CtaBand";

const JOURNEY_CARDS = [
  { icon: Clock, title: "Our Journey So Far", desc: ABOUT.journey },
  { icon: Target, title: "Driven by Purpose", desc: ABOUT.purpose },
  { icon: Globe2, title: "Worldwide Impact", desc: ABOUT.impact },
];

export default function About() {
  useEffect(() => {
    document.title = "About Us | Godavari Wave Technologies";
  }, []);

  return (
    <>
      <PageHeader
        crumb="Home / About Us"
        title="About"
        highlight="Godavari Wave"
        eyebrow="Based in Hyderabad, Telangana"
        desc={ABOUT.mission}
      />

      <section className="relative py-16 sm:py-24" data-testid="about-intro">
        <div className="container-gwt grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[#087BFF]/20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <img
                src="/assests/images/about/aboutimg.jpg"
                alt="Godavari Wave Technologies office"
                loading="lazy"
                className="col-span-2 h-64 w-full rounded-2xl border border-white/10 object-cover"
              />
              <img
                src="/assests/images/about/aboutimg1.jpg"
                alt="Team at work"
                loading="lazy"
                className="h-48 w-full rounded-2xl border border-white/10 object-cover"
              />
              <div className="glass-card glass-glow flex h-48 flex-col items-center justify-center rounded-2xl text-center">
                <p className="font-display text-4xl font-bold text-white">
                  <Counter to={50} suffix="+" />
                </p>
                <p className="mt-2 px-4 text-xs uppercase tracking-widest text-slate-400">
                  Powered by Innovators
                </p>
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="About Godavari Wave"
              title="We Provide You"
              highlight="Flexible Services"
              desc={ABOUT.intro}
            />
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
              {FLEX_SERVICES.map((f) => {
                return (
                  <StaggerItem key={f.title}>
                    <div
                      data-testid={`flex-service-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="glass-card card-hover flex items-center gap-4 p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#087BFF]/25 to-[#00C8FF]/10 text-[#00C8FF]">
                        <ServiceGlyph name={f.icon} />
                      </span>
                      <span className="text-sm font-semibold text-white">{f.title}</span>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="about-pillars">
        <div className="container-gwt">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {JOURNEY_CARDS.map((c) => (
              <StaggerItem key={c.title} className="h-full">
                <div className="group glass-card card-hover h-full p-8">
                  <span className="flex h-13 w-13 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-[#087BFF]/25 to-[#00C8FF]/10 p-3.5 text-[#00C8FF]" style={{ height: 52, width: 52 }}>
                    <c.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">{c.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="about-stats">
        <div className="container-gwt">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT.aboutStats.map((s) => (
              <StaggerItem key={s.label} className="h-full">
                <div className="glass-card card-hover h-full p-7 text-center">
                  <p className="font-display text-4xl font-bold text-white sm:text-5xl">
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#00C8FF]">{s.label}</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">{s.sub}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="about-presence">
        <div className="container-gwt">
          <SectionHeading
            eyebrow="Our Presence"
            title="Every Branch, A New Beginning."
            highlight="Every Journey, A New Success."
            desc="With multiple branches across different locations, we are always near you to provide the best services and support."
          />
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { t: "4 Branches", d: "Extending Our Reach" },
              { t: "Stronger Together", d: "Driven by Shared Ambitions" },
              { t: "Future Focused", d: "Opening Doors to New Possibilities" },
            ].map((m) => (
              <StaggerItem key={m.t}>
                <div className="glass-card card-hover flex items-center gap-4 p-6">
                  <span className="h-10 w-1 rounded-full bg-gradient-to-b from-[#087BFF] to-[#00C8FF]" />
                  <div>
                    <p className="font-display text-lg font-bold text-white">{m.t}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{m.d}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRANCHES.map((b) => (
              <BranchCard key={b.city} b={b} />
            ))}
          </Stagger>
          <Reveal className="mt-8 text-center">
            <p className="eyebrow justify-center">Connecting Businesses Across India</p>
          </Reveal>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="about-training">
        <div className="container-gwt">
          <Reveal>
            <div className="noise-overlay relative overflow-hidden rounded-3xl border border-[#00C8FF]/25 bg-gradient-to-br from-[#071426] via-[#050B16] to-[#087BFF]/15 p-8 sm:p-12 lg:p-14">
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#087BFF]/25 blur-[100px]" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087BFF] to-[#00C8FF] text-white shadow-[0_0_30px_rgba(8,123,255,0.5)]">
                    <GraduationCap className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl">
                    {TRAINING.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{TRAINING.desc}</p>
                  <div className="mt-6 flex gap-8">
                    {TRAINING.stats.map((s) => (
                      <div key={s.label}>
                        <p className="font-display text-3xl font-bold text-white">
                          <Counter to={s.to} suffix={s.suffix} />
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <GlowButton to="/contact" testid="training-enquiry-button">
                      Enquire About Training
                    </GlowButton>
                  </div>
                </div>
                <div className="grid gap-4">
                  {TRAINING.highlights.map((h, i) => {
                    const Icon = { Lightbulb, UserCheck, Handshake }[h.icon.replace("lucide:", "")] || Lightbulb;
                    return (
                      <motion.div
                        key={h.title}
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12, duration: 0.6 }}
                        className="glass-card card-hover flex items-start gap-4 p-5"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087BFF]/20 text-[#00C8FF]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-display font-bold text-white">{h.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">{h.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

function ServiceGlyph({ name }) {
  const { icons } = require("lucide-react");
  const Icon = icons[name.replace("lucide:", "")] || icons.Globe;
  return <Icon className="h-5 w-5" />;
}
