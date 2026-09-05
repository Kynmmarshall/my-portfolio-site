"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, Pause, Play } from "lucide-react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { DeviceTiltControl } from "@/components/motion/DeviceTiltControl";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/projects", label: "Work" },
  { href: "/expertise", label: "Expertise" },
  { href: "/resume", label: "Profile" },
  { href: "/insights", label: "Insights" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { paused, setPaused, reducedMotion } = useVisualPreferences();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Kynmmarshall home"
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
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/#contact" className="header-contact">
          Let&apos;s talk <ArrowUpRight size={16} />
        </Link>
        <ThemeToggle />
        <DeviceTiltControl />
        <button
          className="icon-button effects-toggle"
          disabled={reducedMotion}
          onClick={() => setPaused(!paused)}
          aria-label={
            reducedMotion
              ? "Background effects respect reduced motion"
              : paused
                ? "Resume background effects"
                : "Pause background effects"
          }
          title={
            reducedMotion
              ? "Reduced motion enabled"
              : paused
                ? "Resume background effects"
                : "Pause background effects"
          }
        >
          {paused || reducedMotion ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          className="icon-button mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
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
          aria-label="Mobile navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          {[...links, { href: "/#contact", label: "Contact" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
