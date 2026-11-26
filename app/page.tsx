import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { HeroSection } from "@/components/hero/HeroSection";
import { ProjectGrid } from "@/components/projects/ProjectCard";
import { ContactSection } from "@/components/contact/ContactSection";
import { Reveal } from "@/components/motion/Reveal";
import { InsightsPreview } from "@/components/insights/InsightsPreview";
import { featuredProjects } from "@/content/projects";
import { profile } from "@/content/profile";
import { L, T } from "@/components/i18n/T";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <section className="shell section" id="work" data-scene="work">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span /> <T en="IDEAS, MADE REAL" fr="DES IDÉES, CONCRÉTISÉES" />
              </p>
              <h2>
                <T en="Selected work" fr="Projets sélectionnés" />
                <small> / 05</small>
              </h2>
            </div>
            <Link href="/projects" className="text-link">
              <T en="The full collection" fr="Toute la collection" />{" "}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <ProjectGrid projects={featuredProjects.slice(0, 4)} />
          <div className="work-bottom">
            <Link href="/projects" className="button button-light">
              <T
                en="More projects, more possibilities"
                fr="Plus de projets, plus de possibilités"
              />{" "}
              <Plus size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="shell section" id="insights" data-scene="insights">
        <InsightsPreview />
      </section>
      <section
        className="shell section about-section"
        id="about"
        data-scene="about"
      >
        <div className="portrait-wrap">
          <Image
            src="/media/profile/portrait.webp"
            alt="Kamdeu Yamdjeuson Neil Marshall"
            fill
            sizes="(max-width: 640px) 230px, 360px"
          />
        </div>
        <div>
          <p className="eyebrow">
            <span />{" "}
            <T
              en="THE PERSON BEHIND THE CODE"
              fr="LA PERSONNE DERRIÈRE LE CODE"
            />
          </p>
          <h2>
            <T
              en={
                <>
                  Curiosity is the
                  <br />
                  common thread.
                </>
              }
              fr={
                <>
                  La curiosité est
                  <br />
                  le fil conducteur.
                </>
              }
            />
          </h2>
          <p>
            <L text={profile.bio} />
          </p>
          <p>
            <T
              en="I like understanding how things work, then making them work better. Whether it's a game loop or a deployment pipeline, my approach is the same: start with the problem, make deliberate choices, and keep learning."
              fr="J'aime comprendre comment les choses fonctionnent, puis les faire mieux fonctionner. Qu'il s'agisse d'une boucle de jeu ou d'un pipeline de déploiement, mon approche est la même : partir du problème, faire des choix réfléchis et continuer à apprendre."
            />
          </p>
          <Link href="/expertise" className="text-link">
            <T en="Explore my expertise" fr="Découvrir mon expertise" />{" "}
            <ArrowUpRight size={16} />
          </Link>
          <div className="about-facts">
            <div>
              <span>
                <T en="BASED IN" fr="BASÉ AU" />
              </span>
              <T en="Cameroon" fr="Cameroun" />
            </div>
            <div>
              <span>
                <T en="LANGUAGES" fr="LANGUES" />
              </span>
              <T en="English & French" fr="Anglais et français" />
            </div>
            <div>
              <span>
                <T en="ON THE WEB" fr="SUR LE WEB" />
              </span>
              <a href={profile.github} target="_blank" rel="noreferrer">
                @Kynmmarshall
              </a>
            </div>
          </div>
        </div>
      </section>
      <ContactSection />
    </>
  );
}
