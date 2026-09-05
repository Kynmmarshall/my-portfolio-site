import type { Metadata } from "next";
import Link from "next/link";
import { profile, pillars } from "@/content/profile";
import { featuredProjects } from "@/content/projects";
import { PrintButton } from "@/components/layout/PrintButton";
export const metadata: Metadata = { title: "Engineering profile" };
export default function ResumePage() {
  return <article className="shell prose-page"><p className="eyebrow">ENGINEERING PROFILE</p><h1>{profile.name}</h1><p>Software engineering / Game development / DevOps</p><p>Cameroon / English & French<br /><a href={`mailto:${profile.email}`}>{profile.email}</a> / <a href={profile.github}>GitHub</a> / <a href={profile.linkedin}>LinkedIn</a></p><PrintButton /><h2>About</h2><p>{profile.bio}</p><h2>Core capabilities</h2>{pillars.map((pillar) => <section key={pillar.id}><h3>{pillar.label}</h3><p>{pillar.tools.join(" / ")}</p></section>)}<h2>Selected work</h2>{featuredProjects.map((project) => <section key={project.slug}><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p><strong>{project.role}</strong><br />{project.description}<br /><a href={project.liveUrl}>{project.liveUrl}</a></p></section>)}</article>;
}