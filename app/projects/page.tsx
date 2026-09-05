import type { Metadata } from "next";
import Link from "next/link";
import { ProjectGrid } from "@/components/projects/ProjectCard";
import { projects } from "@/content/projects";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = { title: "Selected work", description: "Applications, games, and the engineering behind them. Explore projects by Kynmmarshall." };
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const current = category === "Applications" || category === "Games" ? category : "All";
  const filtered = current === "All" ? projects : projects.filter((project) => project.category === current);
  return <><div className="shell"><div className="page-heading"><p className="eyebrow"><span /> THE PROJECT INDEX / {projects.length.toString().padStart(2, "0")}</p><h1>Built with intention<span className="accent-text">.</span></h1><p>Cross-platform products, gameplay experiments, and the systems behind the scenes. A closer look at what I build and how I work.</p></div><nav className="filter-tabs" aria-label="Project categories">{["All", "Applications", "Games"].map((filter) => <Link key={filter} href={filter === "All" ? "/projects" : `/projects?category=${filter}`} aria-current={current === filter ? "page" : undefined}>{filter} <span className="mono">({filter === "All" ? projects.length : projects.filter((project) => project.category === filter).length})</span></Link>)}</nav><div className="pb-20"><ProjectGrid projects={filtered} /></div></div><ContactSection /></>;
}