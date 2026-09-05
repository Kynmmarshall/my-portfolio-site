import Link from "next/link";
import { ArrowUpRight, ArrowRight, Code2 } from "lucide-react";
import type { Project } from "@/content/projects";
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
          <span>{project.category}</span>
          <span>/{project.number}</span>
        </div>
        <h3>
          <Link href={`/projects/${project.slug}`}>
            {project.title}
            <ArrowUpRight size={25} />
          </Link>
        </h3>
        <p>{project.description}</p>
        <div className="tags">
          {project.stack.slice(0, 4).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <div className="project-links">
          <Link href={`/projects/${project.slug}`}>
            Case study <ArrowRight size={14} />
          </Link>
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            Live project <ArrowUpRight size={14} />
          </a>
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} source code`}
              title="Source code"
            >
              <Code2 size={17} />
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
