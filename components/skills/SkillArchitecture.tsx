import Link from "next/link";
import { ArrowUpRight, Code2, Gamepad2, Layers3, Server } from "lucide-react";
import { pillars } from "@/content/profile";
import { TechnologyMark } from "./TechnologyMark";

const icons = { server: Server, game: Gamepad2, code: Code2, layers: Layers3 };
export function SkillArchitecture() {
  return (
    <section className="expertise-section" id="expertise">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> THE ENGINEERING TOOLKIT
            </p>
            <h2>
              Different disciplines.
              <br />
              <span className="muted-heading">One considered approach.</span>
            </h2>
          </div>
          <p className="section-description">
            The interface is only the beginning. I care about the code behind
            it, the way it ships, and how it feels to use.
          </p>
        </div>
        <div className="skills-grid">
          {pillars.map((pillar) => {
            const Icon = icons[pillar.icon];
            return (
              <article
                className="skill-pillar"
                key={pillar.id}
                id={pillar.id}
                aria-labelledby={`${pillar.id}-title`}
              >
                <div className="pillar-heading">
                  <span className="pillar-icon">
                    <Icon size={22} />
                  </span>
                  <span className="mono">/{pillar.number}</span>
                </div>
                <p className="eyebrow">{pillar.label}</p>
                <h3 id={`${pillar.id}-title`}>{pillar.title}</h3>
                <p>{pillar.description}</p>
                <ul
                  className="technology-grid"
                  aria-label={`${pillar.label} technologies and practices`}
                >
                  {pillar.tools.map((tool) => (
                    <TechnologyMark key={tool} name={tool} />
                  ))}
                </ul>
                <Link
                  href={`/projects/${pillar.slug}`}
                  className="evidence-link"
                >
                  {pillar.evidence}
                  <ArrowUpRight size={17} />
                </Link>
                {pillar.id === "full-stack" && (
                  <a
                    href="https://github.com/Kynmmarshall/my-portfolio-site"
                    className="evidence-link portfolio-evidence"
                    target="_blank"
                    rel="noreferrer"
                  >
                    This portfolio: Next.js, React, TypeScript & Tailwind CSS{" "}
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
