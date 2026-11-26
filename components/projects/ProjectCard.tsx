import Link from "next/link";
import { ArrowUpRight, ArrowRight, Code2, Smartphone } from "lucide-react";
import { CATEGORY_LABEL, type Project } from "@/content/projects";
import { termLabel } from "@/content/terms";
import { L, SrOnly, T } from "@/components/i18n/T";
import { ProjectLogo } from "./ProjectLogo";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <ProjectLogo
        title={project.title}
        slug={project.slug}
        logo={project.logo}
        color={project.color}
      />
      <div className="project-card-body">
        <div className="project-overline">
          <span>
            <L text={CATEGORY_LABEL[project.category]} />
          </span>
          <span>/{project.number}</span>
        </div>
        <h3>
          <Link href={`/projects/${project.slug}`}>
            {project.title}
            <ArrowUpRight size={25} />
          </Link>
        </h3>
        <p>
          <L text={project.description} />
        </p>
        <div className="tags">
          {project.stack.slice(0, 4).map((skill) => (
            <span key={skill}>
              <L text={termLabel(skill)} />
            </span>
          ))}
        </div>
        <div className="project-links">
          <Link href={`/projects/${project.slug}`}>
            <T en="Case study" fr="Étude de cas" /> <ArrowRight size={14} />
          </Link>
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            <T en="Live project" fr="Projet en ligne" />{" "}
            <ArrowUpRight size={14} />
          </a>
          {project.playStore && (
            <a
              href={project.playStore.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Smartphone size={14} />
              Google Play
            </a>
          )}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={17} />
              <SrOnly
                en={`${project.title} source code`}
                fr={`Code source de ${project.title}`}
              />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
