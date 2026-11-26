import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Gamepad2,
  GitBranch,
  Server,
} from "lucide-react";
import { SceneControls } from "./SceneControls";
import { SceneInteractionZone } from "@/components/motion/SceneInteractionZone";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { T } from "@/components/i18n/T";

export function HeroSection() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title" data-scene="hero">
        {/* A plain image: no canvas, no parallax, nothing that can drift or reappear on scroll. */}
        <div className="hero-scene" aria-hidden="true">
          <Image
            src="/media/profile/portrait.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 38vw"
            className="scene-poster portrait-fallback"
          />
        </div>
        <div className="hero-coordinate" aria-hidden="true">
          03.8480 N / 11.5021 E<br />
          <T en="YAOUNDE, CAMEROON" fr="YAOUNDÉ, CAMEROUN" />
        </div>
        <div className="shell hero-inner">
          <div className="hero-topline">
            <span className="status-dot" />{" "}
            <T
              en="INDEPENDENT MIND. CONNECTED SYSTEMS."
              fr="ESPRIT INDÉPENDANT. SYSTÈMES CONNECTÉS."
            />
          </div>
          <h1 id="hero-title">
            Kamdeu
            <span className="name-secondary">
              Yamdjeuson<span className="accent-text">.</span>
            </span>
            <small>
              <T
                en="Neil Marshall / Software engineer"
                fr="Neil Marshall / Ingénieur logiciel"
              />
            </small>
          </h1>
          <p className="hero-copy">
            <T
              en={
                <>
                  From the first pixel to the final deployment.
                  <br />I build applications, interactive worlds, and the
                  systems that bring them to life.
                </>
              }
              fr={
                <>
                  Du premier pixel au déploiement final.
                  <br />
                  Je conçois des applications, des univers interactifs et les
                  systèmes qui leur donnent vie.
                </>
              }
            />
          </p>
          <div className="hero-actions">
            <Link href="#work" className="button button-dark">
              <T en="Explore my work" fr="Découvrir mes projets" />{" "}
              <ArrowDownRight size={18} />
            </Link>
            <Link href="#contact" className="button button-light">
              <T en="Let's build something" fr="Construisons quelque chose" />{" "}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <SocialLinks
            id="hero-social"
            label={{ en: "Connect with Marshall", fr: "Me retrouver en ligne" }}
          />
        </div>
        <div className="shell hero-bottom">
          <div className="hero-tools">
            <SceneInteractionZone />
            <SceneControls />
          </div>
        </div>
      </section>
      <div className="shell discipline-band">
        <span>
          <Code2 size={17} />{" "}
          <T en="Full-stack development" fr="Développement full-stack" />
        </span>
        <span className="cross">+</span>
        <span>
          <Server size={17} />{" "}
          <T en="DevOps & infrastructure" fr="DevOps et infrastructure" />
        </span>
        <span className="cross">+</span>
        <span>
          <Gamepad2 size={17} />{" "}
          <T en="Game development" fr="Développement de jeux" />
        </span>
        <span className="cross">+</span>
        <span>
          <GitBranch size={17} /> <T en="Open-source thinking" fr="Esprit open source" />
        </span>
      </div>
    </>
  );
}
