import { Link } from "react-router-dom";
import { icons, CheckCircle2, ArrowRight, ArrowUpRight, Phone, MapPin } from "lucide-react";
import { PROJECT_CATS } from "@/data/content";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ServiceCard({ s }) {
  const Icon = s.icon.startsWith("lucide:") ? icons[s.icon.replace("lucide:", "")] : null;
  return (
    <div
      data-testid={`service-card-${s.slug}`}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/60 p-7 backdrop-blur-md card-hover"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00C8FF]/15 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="flex h-13 w-13 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-[#087BFF]/25 to-[#00C8FF]/10 p-3" style={{ height: 52, width: 52 }}>
        {Icon ? (
          <Icon className="h-6 w-6 text-[#00C8FF]" />
        ) : (
          <img src={s.icon} alt="" className="h-7 w-7 object-contain" />
        )}
      </span>
      <h3 className="mt-5 font-display text-xl font-bold text-white">{s.title}</h3>
      <ul className="mt-4 space-y-2.5">
        {s.points.map((pt) => (
          <li key={pt} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#087BFF]" />
            {pt}
          </li>
        ))}
      </ul>
      <Link
        to="/contact"
        data-testid={`service-cta-${s.slug}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 transition-colors duration-300 hover:text-cyan-300"
      >
        Get this service
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export function SolutionCard({ s }) {
  return (
    <div data-testid={`solution-card-${slugify(s.title)}`} className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/60 backdrop-blur-md card-hover">
      <div className="relative h-44 overflow-hidden">
        <img
          src={s.img}
          alt={s.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-[#050B16]/80 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-[#00C8FF] backdrop-blur">
          {s.tag}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-white">{s.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.desc}</p>
        <Link
          to="/portfolio"
          data-testid={`solution-read-case-${slugify(s.title)}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C8FF] transition-colors duration-300 hover:text-white"
        >
          Read Case
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function ProjectCard({ p }) {
  const catLabel = PROJECT_CATS.find((c) => c.id === p.cat)?.label || p.cat;
  return (
    <article
      data-testid={`portfolio-card-${slugify(p.title)}`}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/70 backdrop-blur-md card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
        <img
          src={p.img}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B16] via-[#050B16]/20 to-transparent" />
        {p.soon && (
          <span className="absolute right-3 top-3 rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-amber-300 backdrop-blur">
            Coming Soon
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-cyan-400/30 bg-[#050B16]/80 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-[#00C8FF] backdrop-blur">
          {catLabel}
        </span>
      </div>
      <div className="relative p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-white">{p.title}</h3>
        {p.desc && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-400">{p.desc}</p>}
        {p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span key={t} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 min-h-[28px]">
          {p.link ? (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              data-testid={`portfolio-link-${slugify(p.title)}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C8FF] transition-colors duration-300 hover:text-white"
            >
              View Project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function BranchCard({ b }) {
  return (
    <article
      data-testid={`branch-card-${b.city.toLowerCase()}`}
      className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-[#071426]/60 backdrop-blur-md card-hover"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={b.img}
          alt={`Godavari Wave ${b.city}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071426] to-transparent" />
        {b.hq && (
          <span className="absolute right-3 top-3 rounded-full border border-[#00C8FF]/40 bg-[#087BFF]/25 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-white backdrop-blur">
            Headquarters
          </span>
        )}
        {b.city === "Hyderabad" && (
          <span className="absolute right-3 top-3 rounded-full border border-cyan-300/40 bg-[#087BFF]/30 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-white backdrop-blur">
            Our Hyderabad Office
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-white">{b.city}</h3>
        <p className="mt-3 flex gap-2.5 text-sm leading-relaxed text-slate-400">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />
          {b.address}
        </p>
        <p className="mt-3 flex gap-2.5 text-sm text-slate-400">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />
          <span>
            {b.phones.map((ph) => (
              <a
                key={ph}
                href={`tel:${ph.replace(/\s/g, "")}`}
                data-testid={`branch-phone-${b.city.toLowerCase()}`}
                className="block transition-colors duration-300 hover:text-cyan-300"
              >
                {ph}
              </a>
            ))}
          </span>
        </p>
        <a
          href={b.map}
          target="_blank"
          rel="noreferrer"
          data-testid={`branch-map-link-${b.city.toLowerCase()}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C8FF] transition-colors duration-300 hover:text-white"
        >
          {b.city === "Hyderabad" ? "Get Directions" : "View on Map"}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
