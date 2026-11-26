import type { Metadata } from "next";
import { SkillArchitecture } from "@/components/skills/SkillArchitecture";
import { ContactSection } from "@/components/contact/ContactSection";
import { githubStackSource } from "@/content/github-stack";
import { T } from "@/components/i18n/T";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering expertise",
  description:
    "Explore Kamdeu Yamdjeuson Neil Marshall's languages, frameworks, tools, and project-backed experience across full-stack development, games, DevOps, and core engineering.",
};

export default function ExpertisePage() {
  return (
    <>
      <header className="shell page-heading" data-scene="expertise">
        <p className="eyebrow">
          <span /> <T en="CAPABILITIES & CRAFT" fr="COMPÉTENCES ET SAVOIR-FAIRE" />
        </p>
        <h1>
          <T
            en={
              <>
                Engineering expertise<span className="accent-text">.</span>
              </>
            }
            fr={
              <>
                Expertise en ingénierie<span className="accent-text">.</span>
              </>
            }
          />
        </h1>
        <p>
          <T
            en="From the interface to the infrastructure. My project toolkit, alongside the technologies and practices listed on my GitHub profile."
            fr="De l'interface à l'infrastructure. La boîte à outils de mes projets, ainsi que les technologies et pratiques listées sur mon profil GitHub."
          />
        </p>
        <a
          className="text-link"
          href={githubStackSource.url}
          target="_blank"
          rel="noreferrer"
        >
          <T en="GitHub tech profile" fr="Profil technique GitHub" />{" "}
          <ArrowUpRight size={15} />
        </a>
      </header>
      <SkillArchitecture />
      <ContactSection />
    </>
  );
}
