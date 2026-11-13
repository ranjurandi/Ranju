import { useEffect } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE, BRANCHES } from "@/data/content";

// Get Hyderabad branch details
const HYDERABAD = BRANCHES.find(b => b.city === "Hyderabad");
import { Reveal, Stagger, StaggerItem, SectionHeading, PageHeader } from "@/components/fx";
import { BranchCard } from "@/components/Cards";
import ContactForm from "@/components/ContactForm";

const INFO = [
  {
    icon: MapPin,
    title: "Our Hyderabad Office",
    lines: [HYDERABAD.address],
    testid: "contact-info-location",
  },
  {
    icon: Phone,
    title: "Contact",
    lines: HYDERABAD.phones,
    hrefs: HYDERABAD.phones.map((phone) => `tel:${phone.replace(/\s/g, "")}`),
    testid: "contact-info-phone",
  },
  {
    icon: Mail,
    title: "Email",
    lines: [SITE.emailInfo, SITE.emailHr],
    hrefs: [`mailto:${SITE.emailInfo}`, `mailto:${SITE.emailHr}`],
    testid: "contact-info-email",
  },
  {
    icon: Clock,
    title: "Visit Between",
    lines: HYDERABAD.hours.map(({ day, time }) => `${day}: ${time}`),
    testid: "contact-info-hours",
  },
];

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Us | Godavari Wave Technologies";
  }, []);

  return (
    <>
      <PageHeader
        crumb="Home / Contact Us"
        title="Contact"
        highlight="Us"
        eyebrow="Based in Hyderabad, Telangana · We usually reply within a few hours"
        desc="Contact our team at Meenakshi Tech Park, Phase 2, Gachibowli, Hyderabad, Telangana 500032."
      />

      <section className="relative py-14 sm:py-20" data-testid="contact-info">
        <div className="container-gwt">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFO.map((i) => (
              <StaggerItem key={i.title} className="h-full">
                <div
                  data-testid={i.testid}
                  className="group glass-card card-hover h-full p-7"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-[#087BFF]/25 to-[#00C8FF]/10 text-[#00C8FF]">
                    <i.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{i.title}</h3>
                  <div className="mt-3 space-y-1.5">
                    {i.lines.map((line, idx) =>
                      i.hrefs ? (
                        <a
                          key={line}
                          href={i.hrefs[idx]}
                          data-testid={`${i.testid}-item-${idx}`}
                          className="block break-all text-sm text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                        >
                          {line}
                        </a>
                      ) : (
                        <p key={line} className="text-sm leading-relaxed text-slate-400">
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative pb-20 sm:pb-28" data-testid="contact-form-map">
        <div className="container-gwt grid gap-8 lg:grid-cols-2">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={0.15} className="min-h-[420px]">
            <div className="glass-card flex h-full min-h-[420px] flex-col overflow-hidden p-2">
              <iframe
                data-testid="contact-map-iframe"
                title="Meenakshi Tech Park, Gachibowli, Hyderabad"
                src={SITE.mapEmbed}
                className="min-h-[360px] w-full flex-1 rounded-xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <a
                data-testid="contact-get-directions"
                href={HYDERABAD.map}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#00C8FF] transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Get Directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-20 sm:pb-28" data-testid="contact-branches">
        <div className="container-gwt">
          <SectionHeading
            eyebrow="Our Hyderabad Office and Other Locations"
            title="Our"
            highlight="Branches"
            desc="With multiple branches across different locations, we are always near you to provide the best services and support."
          />
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRANCHES.map((b) => (
              <BranchCard key={b.city} b={b} />
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
