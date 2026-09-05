import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { HeroSection } from "@/components/hero/HeroSection";
import { ProjectGrid } from "@/components/projects/ProjectCard";
import { SkillArchitecture } from "@/components/skills/SkillArchitecture";
import { ContactSection } from "@/components/contact/ContactSection";
import { Reveal } from "@/components/motion/Reveal";
import { InsightsPreview } from "@/components/insights/InsightsPreview";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";

export default function HomePage() {
  return <><HeroSection /><section className="shell section" id="work"><Reveal><div className="section-heading"><div><p className="eyebrow"><span /> IDEAS, MADE REAL</p><h2>Selected work<small> / 05</small></h2></div><Link href="/projects" className="text-link">The full collection <ArrowUpRight size={16} /></Link></div><ProjectGrid projects={featuredProjects.slice(0, 4)} /><div className="work-bottom"><Link href="/projects" className="button button-light">More projects, more possibilities <Plus size={16} /></Link></div></Reveal></section><SkillArchitecture /><section className="shell section"><InsightsPreview /></section><section className="shell section about-section" id="about"><div className="portrait-wrap"><Image src="/media/profile/portrait.webp" alt="Kamdeu Yamdjeuson Neil Marshall" fill sizes="(max-width: 640px) 230px, 360px" /></div><div><p className="eyebrow"><span /> THE PERSON BEHIND THE CODE</p><h2>Curiosity is the<br />common thread.</h2><p>{profile.bio}</p><p>I like understanding how things work, then making them work better. Whether it&apos;s a game loop or a deployment pipeline, my approach is the same: start with the problem, make deliberate choices, and keep learning.</p><div className="about-facts"><div><span>BASED IN</span>Cameroon</div><div><span>LANGUAGES</span>English & French</div><div><span>ON THE WEB</span><a href={profile.github} target="_blank" rel="noreferrer">@Kynmmarshall</a></div></div></div></section><ContactSection /></>;
}