import type { Metadata } from "next";
import { SkillArchitecture } from "@/components/skills/SkillArchitecture";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Engineering expertise",
  description: "Explore Kamdeu Yamdjeuson Neil Marshall's languages, frameworks, tools, and project-backed experience across full-stack development, games, DevOps, and core engineering.",
};

export default function ExpertisePage() {
  return <>
    <header className="shell page-heading">
      <p className="eyebrow"><span /> CAPABILITIES & CRAFT</p>
      <h1>Engineering expertise<span className="accent-text">.</span></h1>
      <p>From the interface to the infrastructure. The languages, tools, and practices I use to turn an idea into a working product.</p>
    </header>
    <SkillArchitecture />
    <ContactSection />
  </>;
}