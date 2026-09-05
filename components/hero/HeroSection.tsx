import Link from "next/link";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Gamepad2,
  GitBranch,
  Server,
} from "lucide-react";
import { HeroSceneLoader, SceneControls } from "./HeroSceneLoader";

export function HeroSection() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <HeroSceneLoader />
        <div className="hero-coordinate" aria-hidden="true">
          03.8480 N / 11.5021 E<br />
          YAOUNDE, CAMEROON
        </div>
        <div className="shell hero-inner">
          <div className="hero-topline">
            <span className="status-dot" /> INDEPENDENT MIND. CONNECTED SYSTEMS.
          </div>
          <h1 id="hero-title">
            Kamdeu
            <span className="name-secondary">
              Yamdjeuson<span className="accent-text">.</span>
            </span>
            <small>Neil Marshall / Software engineer</small>
          </h1>
          <p className="hero-copy">
            From the first pixel to the final deployment.
            <br />I build applications, interactive worlds, and the systems that
            bring them to life.
          </p>
          <div className="hero-actions">
            <Link href="#work" className="button button-dark">
              Explore my work <ArrowDownRight size={18} />
            </Link>
            <Link href="#contact" className="button button-light">
              Let&apos;s build something <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="shell hero-bottom">
          <Link href="#work">
            SELECTED WORK BELOW <ArrowDown size={14} />
          </Link>
          <SceneControls />
        </div>
      </section>
      <div className="shell discipline-band">
        <span>
          <Code2 size={17} /> Full-stack development
        </span>
        <span className="cross">+</span>
        <span>
          <Server size={17} /> DevOps & infrastructure
        </span>
        <span className="cross">+</span>
        <span>
          <Gamepad2 size={17} /> Game development
        </span>
        <span className="cross">+</span>
        <span>
          <GitBranch size={17} /> Open-source thinking
        </span>
      </div>
    </>
  );
}
