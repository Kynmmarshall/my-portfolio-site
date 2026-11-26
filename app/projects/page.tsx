import type { Metadata } from "next";
import Link from "next/link";
import { ProjectGrid } from "@/components/projects/ProjectCard";
import { CATEGORY_LABEL, projects } from "@/content/projects";
import { ContactSection } from "@/components/contact/ContactSection";
import { L, NameFor, T } from "@/components/i18n/T";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Applications, games, and the engineering behind them. Explore projects by Kynmmarshall.",
};
const FILTERS = [
  { key: "All", label: { en: "All", fr: "Tous" } },
  { key: "Applications", label: CATEGORY_LABEL.Applications },
  { key: "Games", label: CATEGORY_LABEL.Games },
] as const;
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const current =
    category === "Applications" || category === "Games" ? category : "All";
  const filtered =
    current === "All"
      ? projects
      : projects.filter((project) => project.category === current);
  return (
    <>
      <div className="shell" data-scene="collection">
        <div className="page-heading">
          <p className="eyebrow">
            <span /> <T en="THE PROJECT INDEX" fr="L'INDEX DES PROJETS" /> /{" "}
            {projects.length.toString().padStart(2, "0")}
          </p>
          <h1>
            <T
              en={
                <>
                  Built with intention<span className="accent-text">.</span>
                </>
              }
              fr={
                <>
                  Conçu avec intention<span className="accent-text">.</span>
                </>
              }
            />
          </h1>
          <p>
            <T
              en="Cross-platform products, gameplay experiments, and the systems behind the scenes. A closer look at what I build and how I work."
              fr="Des produits multiplateformes, des expériences de gameplay et les systèmes en coulisses. Un regard plus précis sur ce que je construis et sur ma façon de travailler."
            />
          </p>
        </div>
        <NameFor
          id="project-categories"
          text={{ en: "Project categories", fr: "Catégories de projets" }}
        />
        <nav className="filter-tabs" aria-labelledby="project-categories">
          {FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={
                filter.key === "All"
                  ? "/projects"
                  : `/projects?category=${filter.key}`
              }
              aria-current={current === filter.key ? "page" : undefined}
            >
              <L text={filter.label} />{" "}
              <span className="mono">
                (
                {filter.key === "All"
                  ? projects.length
                  : projects.filter(
                      (project) => project.category === filter.key,
                    ).length}
                )
              </span>
            </Link>
          ))}
        </nav>
        <div className="pb-20">
          <ProjectGrid projects={filtered} />
        </div>
      </div>
      <ContactSection />
    </>
  );
}
