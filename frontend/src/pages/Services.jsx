import { useEffect } from "react";
import { icons, CheckCircle2 } from "lucide-react";
import { SERVICES, FEATURED_SERVICES, WHY_US } from "@/data/content";
import { Reveal, Stagger, StaggerItem, SectionHeading, PageHeader, GlowButton } from "@/components/fx";
import { ServiceCard } from "@/components/Cards";
import CtaBand from "@/components/CtaBand";

export default function Services() {
  useEffect(() => {
    document.title = "Our Services | Godavari Wave Technologies";
  }, []);

  return (
    <>
      <PageHeader
        crumb="Home / Our Services"
        title="Our"
        highlight="Services"
        eyebrow="Our Main Services"
        desc="From world-class websites to AI-powered platforms — eleven service lines engineered to make your business faster, smarter and global."
      />

      <section className="relative py-16 sm:py-24" data-testid="services-tailored">
        <div className="container-gwt grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="We Are IT Guidance"
              title="Tailored IT Solutions for"
              highlight="Your Success"
              desc="At Godavari Wave Technologies, we understand that every business is unique. That's why we don't believe in one-size-fits-all solutions. Instead, we work closely with you to design, implement, and support IT strategies that align with your goals and drive measurable results."
            />
            <Reveal delay={0.25}>
              <div className="mt-8">
                <GlowButton to="/contact" testid="services-try-now-button">Try It Now</GlowButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[#00C8FF]/15 blur-3xl" />
            <img
              src="/assests/images/about/vectorimg.png"
              alt="Tailored IT solutions illustration"
              loading="lazy"
              className="relative w-full rounded-3xl border border-white/10 object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="services-featured">
        <div className="container-gwt">
          <SectionHeading
            eyebrow="Our Specialize"
            title="Featured"
            highlight="Services"
          />
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
            {FEATURED_SERVICES.map((f) => (
              <StaggerItem key={f.title} className={f.title === "Smart Cards" ? "sm:col-span-2 lg:col-span-1" : ""}>
                <div
                  data-testid={`featured-service-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="group relative h-64 overflow-hidden rounded-2xl border border-white/10 card-hover"
                >
                  <img
                    src={f.img}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050B16] via-[#050B16]/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl font-bold text-white">{f.title}</h3>
                  </div>
                  <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#00C8FF] opacity-0 shadow-[0_0_12px_rgba(0,200,255,0.9)] transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="services-all">
        <div className="container-gwt">
          <SectionHeading
            eyebrow="Full Catalogue"
            title="Everything You Need to"
            highlight="Go Digital & Grow Global"
          />
          <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <ServiceCard key={s.slug} s={s} />
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative py-16 sm:py-24" data-testid="services-why">
        <div className="container-gwt grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Why Us Better"
              title="Why Our Services are Better"
              highlight="Than Others?"
            />
            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
              {WHY_US.map((w) => {
                const Icon = icons[w.icon.replace("lucide:", "")] || CheckCircle2;
                return (
                  <StaggerItem key={w.title}>
                    <div
                      data-testid={`why-us-${w.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="glass-card card-hover flex items-center gap-4 p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#087BFF]/25 to-[#00C8FF]/10 text-[#00C8FF]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-white">{w.title}</span>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
          <Reveal delay={0.15} className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[#087BFF]/20 blur-3xl" />
            <img
              src="/assests/images/about/whychoose.png"
              alt="Why choose Godavari Wave Technologies"
              loading="lazy"
              className="relative w-full rounded-3xl border border-white/10 object-cover"
            />
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
