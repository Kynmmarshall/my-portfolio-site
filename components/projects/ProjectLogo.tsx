"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useText } from "@/hooks/useLocale";

export function ProjectLogo({
  title,
  slug,
  logo,
  color,
}: {
  title: string;
  slug: string;
  logo: string;
  color: string;
}) {
  const root = useRef<HTMLAnchorElement>(null);
  const inView = useInView(root);
  const { paused, reducedMotion } = useVisualPreferences();
  const pageVisible = usePageVisibility();
  const t = useText();
  const moving = inView && pageVisible && !paused && !reducedMotion;
  return (
    <Link
      href={`/projects/${slug}`}
      ref={root}
      className={`project-logo media-${color}`}
      data-project={slug}
      aria-label={t({ en: `Explore ${title}`, fr: `Découvrir ${title}` })}
    >
      <span className="logo-index" aria-hidden="true">
        {slug.replaceAll("-", " ")}
      </span>
      <LazyMotion features={domAnimation}>
        <m.div
          className="project-logo-art"
          initial={false}
          animate={
            moving
              ? { y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }
              : { y: 0, rotate: 0 }
          }
          transition={
            moving
              ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }
          }
        >
          <Image
            src={logo}
            alt={t({ en: `${title} logo`, fr: `Logo ${title}` })}
            fill
            sizes="100px"
            className="project-logo-image"
          />
        </m.div>
      </LazyMotion>
      <span className="logo-shadow" aria-hidden="true" />
      <span className="logo-open">
        <ArrowUpRight size={19} />
      </span>
    </Link>
  );
}
