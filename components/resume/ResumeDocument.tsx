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
import { featuredProjects } from "@/content/projects";
import { PrintButton } from "@/components/layout/PrintButton";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { TechnologyMark } from "@/components/skills/TechnologyMark";

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

export function ResumeDocument() {
  const publishedGame = featuredProjects.find((project) => project.playStore);
  return (
    <div className="shell resume-page">
      <div className="resume-toolbar no-print">
        <Link href="/" className="text-link">
          <ArrowLeft size={15} /> Back to portfolio
        </Link>
        <PrintButton />
      </div>
      <article className="resume-document">
        <header className="resume-header">
          <div className="resume-identity">
            <p className="eyebrow">
              <span /> ENGINEERING PROFILE
            </p>
            <h1>{profile.name}</h1>
            <p className="resume-role">
              Software engineer <span>/</span> Game developer
            </p>
            <div className="resume-meta">
              <span>
                <MapPin size={14} /> Cameroon
              </span>
              <span>
                <Languages size={14} /> English & French
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
            <SocialLinks label="Resume social profiles" />
          </div>
        </header>
        <section
          className="resume-summary"
          aria-labelledby="resume-summary-title"
        >
          <h2 id="resume-summary-title">Profile</h2>
          <p>{profile.bio}</p>
          <p>
            My work connects cross-platform product development, interactive
            gameplay, and automated delivery. I value clear architecture,
            thoughtful user experiences, and practical collaboration.
          </p>
        </section>
        {publishedGame?.playStore && (
          <section
            className="resume-publication"
            aria-labelledby="resume-publication-title"
          >
            <Smartphone size={24} aria-hidden="true" />
            <div>
              <p className="eyebrow">ANDROID PUBLISHING</p>
              <h2 id="resume-publication-title">
                {publishedGame.title} on Google Play
              </h2>
              <p>
                Published under{" "}
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
                View published game <ArrowUpRight size={13} />
              </a>
            </div>
          </section>
        )}
        <div className="resume-columns">
          <aside className="resume-sidebar" aria-label="Technical capabilities">
            <section className="resume-section">
              <div className="resume-section-heading">
                <span className="mono">01</span>
                <h2>Core capabilities</h2>
              </div>
              <ul className="resume-capabilities">
                {pillars.map((pillar) => {
                  const Icon = icons[pillar.icon];
                  return (
                    <li key={pillar.id}>
                      <Icon size={19} aria-hidden="true" />
                      <div>
                        <h3>{pillar.label}</h3>
                        <p>
                          {pillar.id === "infrastructure"
                            ? "CI/CD, VPS delivery, and release automation."
                            : pillar.id === "games"
                              ? "Game loops, input, collision, and real-time graphics."
                              : pillar.id === "full-stack"
                                ? "Cross-platform interfaces, APIs, and data models."
                                : "Modular design, UML, testing, and programming fundamentals."}
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
                <h2>Core toolkit</h2>
              </div>
              <ul
                className="resume-technologies"
                aria-label="Core technologies"
              >
                {toolkit.map((tool) => (
                  <TechnologyMark name={tool} key={tool} />
                ))}
              </ul>
              <Link href="/expertise" className="text-link no-print">
                Complete technology stack <ArrowUpRight size={14} />
              </Link>
            </section>
          </aside>
          <section
            className="resume-work resume-section"
            aria-labelledby="resume-work-title"
          >
            <div className="resume-section-heading">
              <span className="mono">03</span>
              <h2 id="resume-work-title">Selected project experience</h2>
            </div>
            {featuredProjects.map((project) => (
              <article className="resume-project" key={project.slug}>
                <div className="resume-project-heading">
                  <Image
                    src={project.logo}
                    alt={`${project.title} logo`}
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
                    <p className="resume-project-role">{project.role}</p>
                  </div>
                  <span className="resume-project-category">
                    {project.category}
                  </span>
                </div>
                <p>{project.description}</p>
                <ul>
                  {project.highlights.slice(0, 2).map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                {project.slug === "pick-my-dish" && (
                  <p className="resume-collaboration">
                    Co-developed with Tuheu Tchoubi Pempem Moussa Fahdil.
                  </p>
                )}
                <div className="resume-project-footer">
                  <span>{project.stack.join(" / ")}</span>
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
          <span>{profile.handle} / Software, systems & a little play.</span>
          <a href={profile.github}>github.com/Kynmmarshall</a>
        </footer>
      </article>
    </div>
  );
}
