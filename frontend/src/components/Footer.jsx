
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { SITE, SERVICES, BRANCHES, SOCIAL } from "@/data/content";
import { Logo } from "@/components/Navbar";

export default function Footer() {
  const year = new Date().getFullYear();

  const HYDERABAD = BRANCHES.find(
    (b) => b.city === "Hyderabad"
  );

  const phone = HYDERABAD?.phones?.[0] || "+91 77998 22121";

  const phoneLink = phone.replace(/[^\d+]/g, "");

  const officeTimings = HYDERABAD?.hours?.[0]
    ? `${HYDERABAD.hours[0].day}: ${HYDERABAD.hours[0].time}`
    : "Monday-Friday: 9:30 AM-6:30 PM";

  const weeklyHolidays =
    HYDERABAD?.hours?.[1]?.day || "Saturday and Sunday";

  return (
    <footer
      className="relative border-t border-cyan-500/10 bg-[#040910]"
      data-testid="footer"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#087BFF] to-transparent opacity-60" />

      <div className="container-gwt grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-20">

        {/* Company */}
        <div>
          <Logo />

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
            Based in Hyderabad, Telangana, {SITE.legal} transforms
            businesses with mobile, web, and software solutions for clients
            worldwide.
          </p>

          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noreferrer"
            data-testid="footer-whatsapp-link"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition-colors duration-300 hover:border-emerald-300/60"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>

          {/* Social Media */}
          <div className="flex gap-4 mt-6">
            <a
              href={SOCIAL.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              data-testid="footer-facebook"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 5 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 17 22 12z" />
              </svg>
            </a>

            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              data-testid="footer-instagram"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.428.408a4.92 4.92 0 011.71 1.11 4.92 4.92 0 011.11 1.71c.168.458.354 1.258.408 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.408 2.428a4.92 4.92 0 01-1.11 1.71 4.92 4.92 0 01-1.71 1.11c-.458.168-1.258.354-2.428.408-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.428-.408a4.92 4.92 0 01-1.71-1.11 4.92 4.92 0 01-1.11-1.71c-.168-.458-.354-1.258-.408-2.428C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.408-2.428a4.92 4.92 0 011.11-1.71 4.92 4.92 0 011.71-1.11c.458-.168 1.258-.354 2.428-.408C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.735 0 8.332.012 7.052.07 5.775.128 4.78.324 4.027.637a6.983 6.983 0 00-2.539 1.647A6.983 6.983 0 00.637 4.827c-.313.753-.509 1.748-.567 3.025C.012 8.332 0 8.735 0 12c0 3.265.012 3.668.07 4.948.058 1.277.254 2.272.567 3.025a6.983 6.983 0 001.647 2.539 6.983 6.983 0 002.539 1.647c.753.313 1.748.509 3.025.567C8.332 23.988 8.735 24 12 24s3.668-.012 4.948-.07c1.277-.058 2.272-.254 3.025-.567a6.983 6.983 0 002.539-1.647 6.983 6.983 0 001.647-2.539c.313-.753.509-1.748.567-3.025.058-1.28.07-1.683.07-4.948s-.012-3.668-.07-4.948c-.058-1.277-.254-2.272-.567-3.025a6.983 6.983 0 00-1.647-2.539 6.983 6.983 0 00-2.539-1.647c-.753-.313-1.748-.509-3.025-.567C15.668.012 15.265 0 12 0z" />
                <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zM18.406 4.594a1.44 1.44 0 11-2.879 0 1.44 1.44 0 012.879 0z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
            Quick Links
          </h4>

          <ul className="mt-6 space-y-3 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/services", label: "Services" },
              { to: "/portfolio", label: "Portfolio" },
              { to: "/career", label: "Career" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  data-testid={`footer-link-${l.label
                    .toLowerCase()
                    .replace(/\s/g, "-")}`}
                  className="group inline-flex items-center gap-1 text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                >
                  {l.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
            Services
          </h4>

          <ul className="mt-6 space-y-3 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services"
                  data-testid={`footer-service-link-${s.slug}`}
                  className="text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hyderabad Contact */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
            Our Hyderabad Office
          </h4>

          <ul className="mt-6 space-y-4 text-sm text-slate-400">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />
              <span>
                {HYDERABAD?.address ||
                  "Meenakshi Tech Park, Gachibowli, Hyderabad, Telangana"}
              </span>
            </li>

            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />
              <span>
                <a
                  data-testid="footer-phone-1"
                  className="block transition-colors hover:text-cyan-300"
                  href={`tel:${phoneLink}`}
                >
                  {phone}
                </a>
              </span>
            </li>

            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />
              <span>
                <a
                  data-testid="footer-email-info"
                  className="block transition-colors hover:text-cyan-300"
                  href={`mailto:${SITE.emailInfo}`}
                >
                  {SITE.emailInfo}
                </a>

                <a
                  data-testid="footer-email-hr"
                  className="block transition-colors hover:text-cyan-300"
                  href={`mailto:${SITE.emailHr}`}
                >
                  {SITE.emailHr}
                </a>
              </span>
            </li>

            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#00C8FF]" />
              <span>
                <span className="block">{officeTimings}</span>
                <span className="mt-1 block">Closed: {weeklyHolidays}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5">
        <div className="container-gwt flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p data-testid="footer-copyright">
            © {year} {SITE.legal}. All Rights Reserved.
          </p>

          <p className="font-mono tracking-wider">
            {BRANCHES.length} Branches · Hyderabad · Rajahmundry · Vijayawada · Visakhapatnam
          </p>
        </div>
      </div>
    </footer>
  );
}
