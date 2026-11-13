
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion";

import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  ChevronRight
} from "lucide-react";

import {
  HERO,
  STATS,
  CLIENTS_SW,
  CLIENTS_DM,
  SERVICES,
  SOLUTIONS,
  PROCESS,
  PROJECTS,
  FEATURED_WORKS,
  BRANCHES,
  TRAINING,
  ABOUT,
  CASE_STORIES
} from "@/data/content";

import {
  Reveal,
  Stagger,
  StaggerItem,
  SectionHeading,
  Counter,
  GlowButton
} from "@/components/fx";

import HeroMockup from "@/components/HeroMockup";
import ClientMarquee from "@/components/Marquee";
import TechShowcase from "@/components/TechCarousel";

import {
  ServiceCard,
  SolutionCard,
  ProjectCard,
  BranchCard
} from "@/components/Cards";

import CtaBand from "@/components/CtaBand";

const EASE = [0.16, 1, 0.3, 1];

function Hero() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  const sx = useSpring(glowX, {
    stiffness: 40,
    damping: 18
  });

  const sy = useSpring(glowY, {
    stiffness: 40,
    damping: 18
  });

  const glowTransform = useTransform(
    [sx, sy],
    ([x, y]) => `translate(${x - 300}px, ${y - 300}px)`
  );

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const updatePreference = (event) =>
      setPrefersReducedMotion(event.matches);

    motionPreference.addEventListener("change", updatePreference);
    return () =>
      motionPreference.removeEventListener("change", updatePreference);
  }, []);

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#050B16] pt-36 sm:pt-44 lg:pt-48"
      onMouseMove={(e) => {
        glowX.set(e.clientX);
        glowY.set(e.clientY);
      }}
    >
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            <source src="/videos/gwt-home-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#050B16]/55" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-0 grid-bg opacity-70 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_30%,transparent)]" />

        <motion.div
          style={{ transform: glowTransform }}
          className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-[#087BFF]/12 blur-[130px]"
        />

        <div className="absolute -top-24 right-[10%] h-[380px] w-[380px] rounded-full bg-[#00C8FF]/12 blur-[110px]" />
      </div>

      <div className="container-gwt relative z-10 grid items-center gap-14 pb-16 lg:grid-cols-2 lg:gap-10 lg:pb-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/25 bg-[#087BFF]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#00C8FF]"
          >
            <span className="animate-pulse-dot h-2 w-2 rounded-full bg-[#00C8FF]" />
            {HERO.eyebrow}
          </motion.span>

          <h1 className="mt-6 font-display text-[38px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl xl:text-[64px]">
            {[HERO.titleLine1, HERO.titleLine2].map((line, i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  data-testid={`hero-title-line-${i + 1}`}
                  className={`block ${i === 1 ? "shimmer-text" : ""}`}
                  initial={{ y: "112%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.95,
                    delay: 0.15 + i * 0.16,
                    ease: EASE
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            {HERO.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <GlowButton to="/contact" testid="hero-cta-contact">
              Contact Us
            </GlowButton>

            <GlowButton
              to="/services"
              variant="ghost"
              testid="hero-cta-services"
            >
              Explore Services
            </GlowButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/5 pt-6"
          >
            {HERO.focus.map((f) => (
              <div key={f.title} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />

                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-white">
                    {f.title}
                  </span>

                  <span className="mx-1.5 text-slate-600">–</span>
                  {f.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative lg:pl-6">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  return (
    <section className="relative z-10">
      <div className="container-gwt">
        <Stagger className="glass-card glass-glow grid grid-cols-2 overflow-hidden lg:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem
              key={s.label}
              className="flex flex-col items-center gap-1.5 border-white/5 px-6 py-9 text-center [&:nth-child(odd)]:border-r lg:[&:not(:last-child)]:border-r"
            >
              <span
                data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}
                className="font-display text-4xl font-bold text-white sm:text-5xl"
              >
                <Counter to={s.to} suffix={s.suffix} />
              </span>

              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {s.label}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Clients() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="clients-section"
    >
      <div className="container-gwt">
        <SectionHeading
          eyebrow="Trusted Partnerships"
          title="Our Trusted Clients"
          highlight={`(${CLIENTS_SW.length}+ shown, 480+)`}
          desc="From startups to government bodies, businesses across India trust Godavari Wave Technologies to build their digital future."
        />
      </div>

      <div className="mt-10 space-y-4">
        <ClientMarquee
          logos={CLIENTS_SW}
          label="software client"
          testid="marquee-clients-software"
        />

        <div className="container-gwt mt-14">
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Our Digital Marketing Clients{" "}
                <span className="text-gradient">(353+)</span>
              </h3>
            </div>
          </Reveal>
        </div>

        <ClientMarquee
          logos={CLIENTS_DM}
          label="digital marketing client"
          reverse
          testid="marquee-clients-marketing"
        />
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="services-section"
    >
      <div className="container-gwt">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Our Services"
            title="How We Can"
            highlight="Help You"
            desc="Eleven specialised service lines that cover your entire digital journey — from your first website to AI-powered products."
          />

          <Reveal delay={0.2}>
            <GlowButton
              to="/services"
              variant="ghost"
              testid="services-view-all-button"
            >
              All Services
            </GlowButton>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <ServiceCard key={s.slug} s={s} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Solutions() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="solutions-section"
    >
      <div className="pointer-events-none absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-[#087BFF]/10 blur-[130px]" />

      <div className="container-gwt">
        <SectionHeading
          eyebrow="Our Solutions"
          title="Our Product &"
          highlight="Solutions"
          desc="Battle-tested platforms we build, launch and scale — for commerce, food, mobility, healthcare, education and government."
        />

        <Stagger
          className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          gap={0.07}
        >
          {SOLUTIONS.map((s) => (
            <SolutionCard key={s.title} s={s} />
          ))}

          <StaggerItem className="h-full">
            <Link
              to="/contact"
              data-testid="solutions-custom-cta"
              className="group flex h-full min-h-[280px] flex-col items-start justify-between overflow-hidden rounded-2xl border border-[#087BFF]/40 bg-gradient-to-br from-[#087BFF]/25 via-[#071426] to-[#00C8FF]/15 p-8 card-hover"
            >
              <Sparkles className="h-8 w-8 text-[#00C8FF]" />

              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Have a custom idea in mind?
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Let&apos;s engineer it together — from first sketch to global launch.
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Start the conversation

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="about-teaser"
    >
      <div className="container-gwt grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[#087BFF]/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20">
            <img
              src="/assests/images/about/aboutimg.jpg"
              alt="Godavari Wave Technologies team"
              loading="lazy"
              className="h-[420px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#050B16] via-transparent to-transparent" />
          </div>

          <div className="glass-card glass-glow animate-float-y absolute -bottom-8 right-6 flex items-center gap-4 px-6 py-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#087BFF] to-[#00C8FF] text-white">
              <Building2 className="h-5 w-5" />
            </span>

            <div>
              <p className="font-display text-lg font-bold leading-none text-white">
                Since 2024
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Based in Hyderabad, Telangana
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="About Us"
            title="Turning Innovative Ideas Into"
            highlight="Digital Success"
            desc={ABOUT.mission}
          />

          <Reveal delay={0.2}>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {STATS.slice(0, 3).map((s) => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <p className="font-display text-2xl font-bold text-white sm:text-3xl">
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8">
              <GlowButton
                to="/about"
                variant="ghost"
                testid="about-learn-more-button"
              >
                Learn More
              </GlowButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="process-section"
    >
      <div className="container-gwt">
        <SectionHeading
          eyebrow="Working Process"
          title="Our"
          highlight="Approach"
          desc="A proven five-step delivery framework that takes your idea from agreement to a product that keeps getting better."
        />

        <div className="relative mt-14">
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-[#087BFF]/60 to-transparent lg:block" />

          <Stagger
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
            gap={0.1}
          >
            {PROCESS.map((p) => (
              <StaggerItem key={p.no} className="relative">
                <div className="group glass-card card-hover h-full p-6">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#087BFF] to-[#00C8FF] font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(8,123,255,0.5)]">
                    {p.no}
                  </span>

                  <h3 className="mt-5 font-display text-lg font-bold leading-snug text-white">
                    {p.title}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    {p.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

function Tech() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="tech-section"
    >
      <div className="container-gwt">
        <SectionHeading
          eyebrow="Our Technologies"
          title="We Use"
          highlight="Technologies"
          desc="A modern, production-grade stack across web, mobile, databases, cloud, design, AI and tooling."
        />

        <Reveal delay={0.15} className="mt-12">
          <TechShowcase />
        </Reveal>
      </div>
    </section>
  );
}

function RecentWorks() {
  const featured = FEATURED_WORKS
    .map((t) => PROJECTS.find((p) => p.title === t))
    .filter(Boolean);

  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="works-section"
    >
      <div className="container-gwt">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Crafting Success With Project"
            title="Our Recent"
            highlight="Best Works"
            desc="Our recent projects highlight our expertise in delivering tailored solutions that meet the unique needs and objectives of our clients."
          />

          <Reveal delay={0.2}>
            <GlowButton
              to="/portfolio"
              variant="ghost"
              testid="works-all-button"
            >
              All Works
            </GlowButton>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CaseStories() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="case-stories"
    >
      <div className="container-gwt">
        <SectionHeading
          eyebrow="Client Success"
          title="Proven at"
          highlight="Scale"
          desc="Real deployments, real numbers — from state-wide government platforms to classrooms full of future developers."
        />

        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {CASE_STORIES.map((c) => (
            <StaggerItem key={c.title} className="h-full">
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/60 backdrop-blur-md card-hover">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#071426] to-transparent" />

                  <span className="absolute bottom-3 left-4 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
                    {c.fact}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-white">
                    {c.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {c.desc}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Presence() {
  return (
    <section
      className="relative py-20 sm:py-28"
      data-testid="presence-section"
    >
      <div className="container-gwt">
        <SectionHeading
          eyebrow="Our Presence"
          title="Always"
          highlight="Near You"
          desc="With multiple branches across different locations, we are always near you to provide the best services and support."
        />

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BRANCHES.map((b) => (
            <BranchCard key={b.city} b={b} />
          ))}
        </Stagger>

        <Reveal className="mt-14">
          <div
            data-testid="training-banner"
            className="relative overflow-hidden rounded-3xl border border-[#00C8FF]/25 bg-gradient-to-r from-[#071426] via-[#087BFF]/15 to-[#071426] p-8 sm:p-12"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00C8FF]/20 blur-[90px]" />

            <div className="relative flex flex-wrap items-center gap-8">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087BFF] to-[#00C8FF] text-white shadow-[0_0_30px_rgba(8,123,255,0.5)]">
                <GraduationCap className="h-8 w-8" />
              </span>

              <div className="min-w-[240px] flex-1">
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {TRAINING.title}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Hands-on Full Stack Development, Data Structures and Python training with resume building and interview preparation.
                </p>
              </div>

              <div className="flex gap-8">
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

              <Link
                to="/about"
                data-testid="training-link"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C8FF]"
              >
                Meet the Institute

                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    document.title =
      "Godavari Wave Technologies | Software Company in Hyderabad";

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "Godavari Wave Technologies is a software company in Hyderabad, located at Meenakshi Tech Park, Gachibowli, offering custom software development, web and mobile app development, and digital marketing services."
      );
  }, []);

  return (
    <>
      <Hero />
      <StatsBand />
      <Clients />
      <ServicesSection />
      <Solutions />
      <AboutTeaser />
      <Process />
      <Tech />
      <RecentWorks />
      <CaseStories />
      <Presence />
      <CtaBand />
    </>
  );
}
