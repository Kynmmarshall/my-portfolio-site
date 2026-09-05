import Link from "next/link";
import { ArrowUpRight, Code2, Gamepad2, Layers3, Server } from "lucide-react";
import { pillars } from "@/content/profile";

const icons = { server: Server, game: Gamepad2, code: Code2, layers: Layers3 };
export function SkillArchitecture() {
  return <section className="expertise-section" id="expertise"><div className="shell"><div className="section-heading"><div><p className="eyebrow"><span /> THE ENGINEERING TOOLKIT</p><h2>Different disciplines.<br /><span className="muted-heading">One considered approach.</span></h2></div><p className="section-description">The interface is only the beginning. I care about the code behind it, the way it ships, and how it feels to use.</p></div>
    <div className="skills-grid">{pillars.map((pillar) => { const Icon = icons[pillar.icon]; return <article className="skill-pillar" key={pillar.id}><div className="pillar-heading"><span className="pillar-icon"><Icon size={22} /></span><span className="mono">/{pillar.number}</span></div><p className="eyebrow">{pillar.label}</p><h3>{pillar.title}</h3><p>{pillar.description}</p><div className="tags">{pillar.tools.map((tool) => <span key={tool}>{tool}</span>)}</div><Link href={`/projects/${pillar.slug}`} className="evidence-link">{pillar.evidence}<ArrowUpRight size={17} /></Link></article>; })}</div>
  </div></section>;
}