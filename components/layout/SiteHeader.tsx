"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, Pause, Play } from "lucide-react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { useAutoHideHeader } from "@/hooks/useAutoHideHeader";
import { useText } from "@/hooks/useLocale";
import type { Localized } from "@/lib/i18n";
import { T } from "@/components/i18n/T";
import { DeviceTiltControl } from "@/components/motion/DeviceTiltControl";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

const links: { href: string; label: Localized }[] = [
  { href: "/projects", label: { en: "Work", fr: "Projets" } },
  { href: "/expertise", label: { en: "Expertise", fr: "Expertise" } },
  { href: "/resume", label: { en: "Profile", fr: "Profil" } },
  { href: "/insights", label: { en: "Insights", fr: "Statistiques" } },
];
const contactLink: { href: string; label: Localized } = {
  href: "/#contact",
  label: { en: "Contact", fr: "Contact" },
};

const copy = {
  home: { en: "Kynmmarshall home", fr: "Accueil Kynmmarshall" },
  main: { en: "Main navigation", fr: "Navigation principale" },
  mobile: { en: "Mobile navigation", fr: "Navigation mobile" },
  pause: {
    en: "Pause background effects",
    fr: "Mettre en pause les effets d'arrière-plan",
  },
  resume: {
    en: "Resume background effects",
    fr: "Reprendre les effets d'arrière-plan",
  },
  reduced: {
    en: "Background effects respect reduced motion",
    fr: "Les effets d'arrière-plan respectent la réduction des animations",
  },
  reducedTitle: {
    en: "Reduced motion enabled",
    fr: "Réduction des animations activée",
  },
  open: { en: "Open navigation", fr: "Ouvrir la navigation" },
  close: { en: "Close navigation", fr: "Fermer la navigation" },
} satisfies Record<string, Localized>;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { paused, setPaused, reducedMotion } = useVisualPreferences();
  const t = useText();
  // Reduced motion and an open menu keep the header pinned in view.
  const { hidden, reveal } = useAutoHideHeader(reducedMotion || open);
  let effectsLabel = t(copy.pause);
  if (reducedMotion) effectsLabel = t(copy.reduced);
  else if (paused) effectsLabel = t(copy.resume);
  return (
    <header
      className="site-header"
      data-hidden={hidden ? "true" : "false"}
      onFocus={reveal}
    >
      <div className="shell header-inner">
        <Link
          href="/"
          className="brand"
          aria-label={t(copy.home)}
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            <Image
              src="/media/profile/portrait.webp"
              alt=""
              fill
              sizes="33px"
            />
          </span>
          <span>
            kynmmarshall<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label={t(copy.main)}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              <T en={link.label.en} fr={link.label.fr} />
            </Link>
          ))}
        </nav>
        <Link href="/#contact" className="header-contact">
          <T en="Let's talk" fr="Discutons" /> <ArrowUpRight size={16} />
        </Link>
        <LanguageToggle />
        <ThemeToggle />
        <DeviceTiltControl />
        <button
          className="icon-button effects-toggle"
          disabled={reducedMotion}
          onClick={() => setPaused(!paused)}
          aria-label={effectsLabel}
          title={reducedMotion ? t(copy.reducedTitle) : effectsLabel}
        >
          {paused || reducedMotion ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          className="icon-button mobile-toggle"
          aria-label={open ? t(copy.close) : t(copy.open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-menu"
          aria-label={t(copy.mobile)}
          data-lenis-prevent
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          {[...links, contactLink].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              <T en={link.label.en} fr={link.label.fr} />
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
