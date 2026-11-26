import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Smartphone,
} from "lucide-react";
import { CATEGORY_LABEL, getProject, projects } from "@/content/projects";
import { termLabel } from "@/content/terms";
import { L, T } from "@/components/i18n/T";
import { ProjectMedia } from "@/components/projects/ProjectMedia";
import { ContactSection } from "@/components/contact/ContactSection";
import { MediaGallery } from "@/components/projects/MediaGallery";
import { ArchitectureExplorer } from "@/components/projects/ArchitectureExplorer";

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  return {
    title: project?.title ?? "Project not found",
    description: project?.description.en,
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <article className="shell" data-scene="detail">
        <header className="detail-header">
          <Link href="/projects" className="text-link">
            <ArrowLeft size={14} /> <T en="All projects" fr="Tous les projets" />
          </Link>
          <h1>
            {project.title}
            <span className="accent-text">.</span>
          </h1>
          <p>
            <L text={project.description} />
          </p>
          <div className="detail-actions">
            {project.playStore && (
              <a
                href={project.playStore.url}
                className="button button-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Smartphone size={17} />
                <T en="Get it on Google Play" fr="Disponible sur Google Play" />{" "}
                <ArrowUpRight size={17} />
              </a>
            )}
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="button button-dark"
            >
              <T en="Visit live project" fr="Voir le projet en ligne" />{" "}
              <ArrowUpRight size={17} />
            </a>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-light"
              >
                <Code2 size={17} />{" "}
                <T en="View source" fr="Voir le code source" />
              </a>
            )}
          </div>
          {project.playStore && (
            <div className="store-release">
              <p className="eyebrow">
                <T
                  en="PUBLISHED ON GOOGLE PLAY / ANDROID"
                  fr="PUBLIÉ SUR GOOGLE PLAY / ANDROID"
                />
              </p>
              <p>
                <T en="Developer:" fr="Développeur :" />{" "}
                <a
                  href={project.playStore.developerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.playStore.developer} <ArrowUpRight size={13} />
                </a>
              </p>
              <span className="mono">{project.playStore.packageId}</span>
            </div>
          )}
        </header>
        <div className="detail-cover">
          <ProjectMedia
            title={project.title}
            cover={project.cover}
            video={project.video}
            portrait={project.portrait}
            color={project.color}
            priority
          />
        </div>
        <div className="case-layout">
          <dl className="case-meta">
            <div>
              <dt>
                <T en="Discipline" fr="Discipline" />
              </dt>
              <dd>
                <L text={CATEGORY_LABEL[project.category]} />
              </dd>
            </div>
            <div>
              <dt>
                <T en="My role" fr="Mon rôle" />
              </dt>
              <dd>
                <L text={project.role} />
              </dd>
            </div>
            <div>
              <dt>
                <T en="Toolkit" fr="Boîte à outils" />
              </dt>
              <dd className="tags">
                {project.stack.map((tool) => (
                  <span key={tool}>
                    <L text={termLabel(tool)} />
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt>
                <T en="Project evidence" fr="Sources du projet" />
              </dt>
              <dd>
                {project.evidence.map((source) => (
                  <p key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      <L text={source.label} />
                      <ArrowUpRight size={13} />
                    </a>
                  </p>
                ))}
              </dd>
            </div>
          </dl>
          <div className="case-body">
            <section>
              <p className="eyebrow">
                <T en="01 / THE PROBLEM" fr="01 / LE PROBLÈME" />
              </p>
              <h2>
                <T en="A reason to build." fr="Une raison de construire." />
              </h2>
              <p>
                <L text={project.problem} />
              </p>
            </section>
            <section>
              <p className="eyebrow">
                <T en="02 / THE APPROACH" fr="02 / L'APPROCHE" />
              </p>
              <h2>
                <T
                  en="From idea to implementation."
                  fr="De l'idée à la réalisation."
                />
              </h2>
              <p>
                <L text={project.approach} />
              </p>
            </section>
            <section>
              <p className="eyebrow">
                <T en="03 / WHAT'S INSIDE" fr="03 / À L'INTÉRIEUR" />
              </p>
              <h2>
                <T en="The details matter." fr="Les détails comptent." />
              </h2>
              <ul className="highlight-list">
                {project.highlights.map((item) => (
                  <li key={item.en}>
                    <Check size={16} />
                    <L text={item} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
        {project.slug === "pick-my-dish" && <ArchitectureExplorer />}
        {project.gallery.length > 1 && (
          <>
            <div className="section-heading">
              <h2>
                <T en="A closer look." fr="Un regard de plus près." />
              </h2>
            </div>
            <MediaGallery
              images={project.gallery}
              title={project.title}
              landscape={!project.portrait}
            />
          </>
        )}
        <Link href={`/projects/${next.slug}`} className="next-project">
          <span>
            <span className="eyebrow">
              <T en="NEXT PROJECT" fr="PROJET SUIVANT" />
            </span>
            {next.title}
          </span>
          <ArrowRight />
        </Link>
      </article>
      <ContactSection />
    </>
  );
}
