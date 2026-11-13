import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { icons } from "lucide-react";
import {
  siAngular,
  siBitbucket,
  siClaude,
  siCoreldraw,
  siCpanel,
  siDocker,
  siFastapi,
  siFigma,
  siGit,
  siGithub,
  siIonic,
  siJira,
  siLangchain,
  siLaravel,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siRedis,
  siSketch,
  siSqlite,
  siSupabase,
  siSwift,
  siVuedotjs
} from "simple-icons";
import { TECH } from "@/data/content";

const BRAND_ICONS = {
  "React Js": siReact,
  "Next Js": siNextdotjs,
  Node: siNodedotjs,
  Ionic: siIonic,
  Laravel: siLaravel,
  "Vue.js": siVuedotjs,
  Angular: siAngular,
  "React Native": siReact,
  Swift: siSwift,
  MySQL: siMysql,
  MongoDB: siMongodb,
  PostgreSQL: siPostgresql,
  SQLite: siSqlite,
  Redis: siRedis,
  Superbase: siSupabase,
  Docker: siDocker,
  Cpanel: siCpanel,
  CorelDRAW: siCoreldraw,
  Figma: siFigma,
  Sketch: siSketch,
  "Lang chain lang graph implementation": siLangchain,
  "Python Fast Api": siFastapi,
  Claude: siClaude,
  Jira: siJira,
  Bitbucket: siBitbucket,
  Git: siGit,
  GitHub: siGithub
};

const TECHNOLOGY_COLORS = {
  "Next Js": "#FFFFFF",
  AWS: "#FF9900",
  Azure: "#0078D4",
  "Microsoft SQL": "#CC2927",
  "Amazon DynamoDB": "#4053D6",
  "NoSQL Database": "#8B5CF6",
  "Pine Cone Vector Database": "#A87AFF",
  "Adobe Photoshop": "#31A8FF",
  "Adobe Illustrator": "#FF9A00",
  Canva: "#00C4CC",
  "Adobe Premiere Pro": "#9999FF",
  "Adobe After Effects": "#9999FF",
  CapCut: "#FFFFFF",
  Filmora: "#00A4FF",
  "Adobe InDesign": "#FF3366",
  "Adobe XD": "#FF61F6",
  "Ai agents": "#A855F7",
  "Chat bots": "#22C55E",
  "Generative ai": "#E879F9",
  "MCP tool integration": "#8B5CF6",
  "Ci/cd Pipeline": "#F05032",
  GitHub: "#FFFFFF"
};

function getTechnologyColor(item, brandIcon) {
  if (TECHNOLOGY_COLORS[item.name]) return TECHNOLOGY_COLORS[item.name];
  return brandIcon ? `#${brandIcon.hex}` : "#00C8FF";
}

function TechnologyIcon({ item }) {
  const brandIcon = BRAND_ICONS[item.name];
  const color = getTechnologyColor(item, brandIcon);

  if (brandIcon) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-9 w-9"
        style={{ color }}
      >
        <path fill="currentColor" d={brandIcon.path} />
      </svg>
    );
  }

  if (item.icon.startsWith("lucide:")) {
    const Icon = icons[item.icon.slice("lucide:".length)] || icons.CircleHelp;
    return (
      <Icon
        aria-hidden="true"
        className="h-9 w-9"
        style={{ color }}
      />
    );
  }
  return <img src={item.icon} alt={item.name} loading="lazy" className="h-9 w-9 object-contain" />;
}

export default function TechShowcase() {
  const [active, setActive] = useState(TECH[0].id);
  const cat = TECH.find((t) => t.id === active);

  return (
    <div data-testid="tech-showcase">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TECH.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              data-testid={`tech-tab-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                isActive ? "text-white" : "border border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="tech-tab-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] shadow-[0_0_20px_rgba(8,123,255,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {cat.items.map((it) => {
            const iconColor = getTechnologyColor(it, BRAND_ICONS[it.name]);
            return (
              <div
                key={it.name}
                data-testid={`tech-chip-${it.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="group glass-card card-hover flex flex-col items-center gap-3 p-5 text-center"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-xl border p-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-lg"
                  style={{
                    color: iconColor,
                    backgroundColor: `${iconColor}14`,
                    borderColor: `${iconColor}40`,
                    boxShadow: `0 8px 20px ${iconColor}1c`
                  }}
                >
                  <TechnologyIcon item={it} />
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-snug text-slate-300">
                  {it.name}
                </span>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
