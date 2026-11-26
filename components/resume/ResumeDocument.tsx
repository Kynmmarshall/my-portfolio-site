import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Gamepad2,
  Languages,
  Layers3,
  Mail,
  MapPin,
  Server,
  Smartphone,
} from "lucide-react";
import { profile, pillars } from "@/content/profile";
import { CATEGORY_LABEL, featuredProjects } from "@/content/projects";
import { termLabel } from "@/content/terms";
import { L, NameFor, T } from "@/components/i18n/T";
import { PrintButton } from "@/components/layout/PrintButton";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { TechnologyMark } from "@/components/skills/TechnologyMark";
import type { Localized } from "@/lib/i18n";

const toolkit = [
  "Flutter",
  "Dart",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Python",
  "C++",
  "Flame",
  "Git",
  "Jenkins",
] as const;
const icons = { server: Server, game: Gamepad2, code: Code2, layers: Layers3 };
const capabilitySummary: Record<(typeof pillars)[number]["id"], Localized> = {
  infrastructure: {
    en: "CI/CD, VPS delivery, and release automation.",
    fr: "CI/CD, livraison sur VPS et automatisation des releases.",
  },
  games: {
    en: "Game loops, input, collision, and real-time graphics.",
    fr: "Boucles de jeu, entrées, collisions et graphismes en temps réel.",
  },
  "full-stack": {
    en: "Cross-platform interfaces, APIs, and data models.",
    fr: "Interfaces multiplateformes, API et modèles de données.",
  },
  engineering: {
    en: "Modular design, UML, testing, and programming fundamentals.",
    fr: "Conception modulaire, UML, tests et fondamentaux de la programmation.",
  },
};

export function ResumeDocument() {
  const publishedGame = featuredProjects.find((project) => project.playStore);
  return (
    <div className="shell resume-page">
      <div className="resume-toolbar no-print">
        <Link href="/" className="text-link">
          <ArrowLeft size={15} />{" "}
          <T en="Back to portfolio" fr="Retour au portfolio" />
        </Link>
        <PrintButton />
      </div>
      <article className="resume-document">
        <header className="resume-header">
          <div className="resume-identity">
            <p className="eyebrow">
              <span /> <T en="ENGINEERING PROFILE" fr="PROFIL D'INGÉNIEUR" />
            </p>
            <h1>{profile.name}</h1>
            <p className="resume-role">
              <T
                en={
                  <>
                    Software engineer <span>/</span> Game developer
                  </>
                }
                fr={
                  <>
                    Ingénieur logiciel <span>/</span> Développeur de jeux
                  </>
                }
              />
            </p>
            <div className="resume-meta">
              <span>
                <MapPin size={14} /> <T en="Cameroon" fr="Cameroun" />
              </span>
              <span>
                <Languages size={14} />{" "}
                <T en="English & French" fr="Anglais et français" />
              </span>
            </div>
            <a href={`mailto:${profile.email}`} className="resume-email">
              <Mail size={15} />
              {profile.email}
            </a>
          </div>
          <div className="resume-portrait">
            <Image
              src="/media/profile/portrait.webp"
              alt="Kamdeu Yamdjeuson Neil Marshall"
              fill
              priority
              sizes="(max-width: 640px) 100px, 160px"
            />
          </div>
          <div className="resume-social">
            <SocialLinks
              id="resume-social"
              label={{
                en: "Resume social profiles",
                fr: "Profils sociaux du CV",
              }}
            />
          </div>
        </header>
        <section
          className="resume-summary"
          aria-labelledby="resume-summary-title"
        >
          <h2 id="resume-summary-title">
            <T en="Profile" fr="Profil" />
          </h2>
          <p>
            <L text={profile.bio} />
          </p>
          <p>
            <T
              en="My work connects cross-platform product development, interactive gameplay, and automated delivery. I value clear architecture, thoughtful user experiences, and practical collaboration."
              fr="Mon travail relie le développement de produits multiplateformes, le gameplay interactif et la livraison automatisée. J'accorde de la valeur à une architecture claire, à des expériences utilisateur soignées et à une collaboration concrète."
            />
          </p>
        </section>
        {publishedGame?.playStore && (
          <section
            className="resume-publication"
            aria-labelledby="resume-publication-title"
          >
            <Smartphone size={24} aria-hidden="true" />
            <div>
              <p className="eyebrow">
                <T en="ANDROID PUBLISHING" fr="PUBLICATION ANDROID" />
              </p>
              <h2 id="resume-publication-title">
                <T
                  en={`${publishedGame.title} on Google Play`}
                  fr={`${publishedGame.title} sur Google Play`}
                />
              </h2>
              <p>
                <T en="Published under" fr="Publié sous le nom de" />{" "}
                <a
                  href={profile.playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {publishedGame.playStore.developer}
                </a>
                .
              </p>
              <a
                className="text-link"
                href={publishedGame.playStore.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <T en="View published game" fr="Voir le jeu publié" />{" "}
                <ArrowUpRight size={13} />
              </a>
            </div>
          </section>
        )}
        <div className="resume-columns">
          <NameFor
            id="resume-capabilities-label"
            text={{ en: "Technical capabilities", fr: "Compétences techniques" }}
          />
          <aside
            className="resume-sidebar"
            aria-labelledby="resume-capabilities-label"
          >
            <section className="resume-section">
              <div className="resume-section-heading">
                <span className="mono">01</span>
                <h2>
                  <T en="Core capabilities" fr="Compétences clés" />
                </h2>
              </div>
              <ul className="resume-capabilities">
                {pillars.map((pillar) => {
                  const Icon = icons[pillar.icon];
                  return (
                    <li key={pillar.id}>
                      <Icon size={19} aria-hidden="true" />
                      <div>
                        <h3>
                          <L text={pillar.label} />
                        </h3>
                        <p>
                          <L text={capabilitySummary[pillar.id]} />
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="resume-section">
              <div className="resume-section-heading">
                <span className="mono">02</span>
                <h2>
                  <T en="Core toolkit" fr="Outils principaux" />
                </h2>
              </div>
              <NameFor
                id="resume-technologies-label"
                text={{
                  en: "Core technologies",
                  fr: "Technologies principales",
                }}
              />
              <ul
                className="resume-technologies"
                aria-labelledby="resume-technologies-label"
              >
                {toolkit.map((tool) => (
                  <TechnologyMark name={tool} key={tool} />
                ))}
              </ul>
              <Link href="/expertise" className="text-link no-print">
                <T
                  en="Complete technology stack"
                  fr="Pile technologique complète"
                />{" "}
                <ArrowUpRight size={14} />
              </Link>
            </section>
          </aside>
          <section
            className="resume-work resume-section"
            aria-labelledby="resume-work-title"
          >
            <div className="resume-section-heading">
              <span className="mono">03</span>
              <h2 id="resume-work-title">
                <T
                  en="Selected project experience"
                  fr="Expérience projet sélectionnée"
                />
              </h2>
            </div>
            {featuredProjects.map((project) => (
              <article className="resume-project" key={project.slug}>
                <div className="resume-project-heading">
                  <Image
                    src={project.logo}
                    alt=""
                    width={44}
                    height={44}
                  />
                  <div>
                    <h3>
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                        <ArrowUpRight size={15} className="no-print" />
                      </Link>
                    </h3>
                    <p className="resume-project-role">
                      <L text={project.role} />
                    </p>
                  </div>
                  <span className="resume-project-category">
                    <L text={CATEGORY_LABEL[project.category]} />
                  </span>
                </div>
                <p>
                  <L text={project.description} />
                </p>
                <ul>
                  {project.highlights.slice(0, 2).map((highlight) => (
                    <li key={highlight.en}>
                      <L text={highlight} />
                    </li>
                  ))}
                </ul>
                {project.slug === "pick-my-dish" && (
                  <p className="resume-collaboration">
                    <T
                      en="Co-developed with Tuheu Tchoubi Pempem Moussa Fahdil."
                      fr="Co-développé avec Tuheu Tchoubi Pempem Moussa Fahdil."
                    />
                  </p>
                )}
                <div className="resume-project-footer">
                  <span>
                    {project.stack.map((tool, index) => (
                      <Fragment key={tool}>
                        {index > 0 && " / "}
                        <L text={termLabel(tool)} />
                      </Fragment>
                    ))}
                  </span>
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    {new URL(project.liveUrl).hostname}
                    <ArrowUpRight size={12} className="no-print" />
                  </a>
                </div>
              </article>
            ))}
          </section>
        </div>
        <footer className="resume-document-footer">
          <span>
            {profile.handle} /{" "}
            <T
              en="Software, systems & a little play."
              fr="Logiciel, systèmes et un peu de jeu."
            />
          </span>
          <a href={profile.github}>github.com/Kynmmarshall</a>
        </footer>
      </article>
    </div>
  );
}
