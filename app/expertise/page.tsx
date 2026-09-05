import type { Metadata } from "next";
import { SkillArchitecture } from "@/components/skills/SkillArchitecture";
import { ContactSection } from "@/components/contact/ContactSection";
import { githubStackSource } from "@/content/github-stack";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering expertise",
  description:
    "Explore Kamdeu Yamdjeuson Neil Marshall's languages, frameworks, tools, and project-backed experience across full-stack development, games, DevOps, and core engineering.",
};

export default function ExpertisePage() {
  return (
    <>
      <header className="shell page-heading">
        <p className="eyebrow">
          <span /> CAPABILITIES & CRAFT
        </p>
        <h1>
          Engineering expertise<span className="accent-text">.</span>
        </h1>
        <p>
          From the interface to the infrastructure. My project toolkit,
          alongside the technologies and practices listed on my GitHub profile.
        </p>
        <a
          className="text-link"
          href={githubStackSource.url}
          target="_blank"
          rel="noreferrer"
        >
          GitHub tech profile <ArrowUpRight size={15} />
        </a>
      </header>
      <SkillArchitecture />
      <ContactSection />
    </>
  );
}
