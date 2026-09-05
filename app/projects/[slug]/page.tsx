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
import { getProject, projects } from "@/content/projects";
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
    description: project?.description,
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
      <article className="shell">
        <header className="detail-header">
          <Link href="/projects" className="text-link">
            <ArrowLeft size={14} /> All projects
          </Link>
          <h1>
            {project.title}
            <span className="accent-text">.</span>
          </h1>
          <p>{project.description}</p>
          <div className="detail-actions">
            {project.playStore && (
              <a
                href={project.playStore.url}
                className="button button-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Smartphone size={17} />
                Get it on Google Play <ArrowUpRight size={17} />
              </a>
            )}
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="button button-dark"
            >
              Visit live project <ArrowUpRight size={17} />
            </a>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="button button-light"
              >
                <Code2 size={17} /> View source
              </a>
            )}
          </div>
          {project.playStore && (
            <div className="store-release">
              <p className="eyebrow">PUBLISHED ON GOOGLE PLAY / ANDROID</p>
              <p>
                Developer:{" "}
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
              <dt>Discipline</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt>My role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Toolkit</dt>
              <dd className="tags">
                {project.stack.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Project evidence</dt>
              <dd>
                {project.evidence.map((source) => (
                  <p key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      {source.label}
                      <ArrowUpRight size={13} />
                    </a>
                  </p>
                ))}
              </dd>
            </div>
          </dl>
          <div className="case-body">
            <section>
              <p className="eyebrow">01 / THE PROBLEM</p>
              <h2>A reason to build.</h2>
              <p>{project.problem}</p>
            </section>
            <section>
              <p className="eyebrow">02 / THE APPROACH</p>
              <h2>From idea to implementation.</h2>
              <p>{project.approach}</p>
            </section>
            <section>
              <p className="eyebrow">03 / WHAT&apos;S INSIDE</p>
              <h2>The details matter.</h2>
              <ul className="highlight-list">
                {project.highlights.map((item) => (
                  <li key={item}>
                    <Check size={16} />
                    {item}
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
              <h2>A closer look.</h2>
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
            <span className="eyebrow">NEXT PROJECT</span>
            {next.title}
          </span>
          <ArrowRight />
        </Link>
      </article>
      <ContactSection />
    </>
  );
}
