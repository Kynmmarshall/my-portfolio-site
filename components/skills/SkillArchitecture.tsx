import Link from "next/link";
import { ArrowUpRight, Code2, Gamepad2, Layers3, Server } from "lucide-react";
import { pillars } from "@/content/profile";
import { L, NameFor, T } from "@/components/i18n/T";
import { TechnologyMark } from "./TechnologyMark";

const icons = { server: Server, game: Gamepad2, code: Code2, layers: Layers3 };
export function SkillArchitecture() {
  return (
    <section className="expertise-section" id="expertise">
      <div className="shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> <T en="THE ENGINEERING TOOLKIT" fr="LA BOÎTE À OUTILS DE L'INGÉNIEUR" />
            </p>
            <h2>
              <T
                en={
                  <>
                    Different disciplines.
                    <br />
                    <span className="muted-heading">
                      One considered approach.
                    </span>
                  </>
                }
                fr={
                  <>
                    Des disciplines différentes.
                    <br />
                    <span className="muted-heading">
                      Une approche réfléchie.
                    </span>
                  </>
                }
              />
            </h2>
          </div>
          <p className="section-description">
            <T
              en="The interface is only the beginning. I care about the code behind it, the way it ships, and how it feels to use."
              fr="L'interface n'est que le début. Je m'intéresse au code qui se cache derrière, à la façon dont il est livré et à l'effet qu'il produit à l'usage."
            />
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
                <p className="eyebrow">
                  <L text={pillar.label} />
                </p>
                <h3 id={`${pillar.id}-title`}>
                  <L text={pillar.title} />
                </h3>
                <p>
                  <L text={pillar.description} />
                </p>
                <NameFor
                  id={`${pillar.id}-tools-label`}
                  text={{
                    en: `${pillar.label.en} technologies and practices`,
                    fr: `Technologies et pratiques : ${pillar.label.fr}`,
                  }}
                />
                <ul
                  className="technology-grid"
                  aria-labelledby={`${pillar.id}-tools-label`}
                >
                  {pillar.tools.map((tool) => (
                    <TechnologyMark key={tool} name={tool} />
                  ))}
                </ul>
                <Link
                  href={`/projects/${pillar.slug}`}
                  className="evidence-link"
                >
                  <L text={pillar.evidence} />
                  <ArrowUpRight size={17} />
                </Link>
                {pillar.id === "full-stack" && (
                  <a
                    href="https://github.com/Kynmmarshall/my-portfolio-site"
                    className="evidence-link portfolio-evidence"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <T
                      en="This portfolio: Next.js, React, TypeScript & Tailwind CSS"
                      fr="Ce portfolio : Next.js, React, TypeScript et Tailwind CSS"
                    />{" "}
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
