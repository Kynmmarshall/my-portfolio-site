import Image from "next/image";
import { Mail, Play } from "lucide-react";
import { profile } from "@/content/profile";
import { NameFor, T } from "@/components/i18n/T";
import type { Localized } from "@/lib/i18n";
import githubLogo from "@/images/github.png";
import linkedinLogo from "@/images/LinkedIn.png";
import itchLogo from "@/images/itch.png";
import whatsappLogo from "@/images/whatsapp.png";

const platforms = [
  { name: "GitHub", url: profile.github, logo: githubLogo },
  { name: "LinkedIn", url: profile.linkedin, logo: linkedinLogo },
  { name: "itch.io", url: profile.itch, logo: itchLogo },
  { name: "WhatsApp", url: profile.whatsapp, logo: whatsappLogo },
];

/** `id` must be unique per instance: it names the landmark for assistive technology. */
export function SocialLinks({ id, label }: { id: string; label: Localized }) {
  const labelId = `${id}-label`;
  const newTabId = `${id}-new-tab`;
  return (
    <>
      <NameFor id={labelId} text={label} />
      <span id={newTabId} className="sr-only">
        <T en="Opens in a new tab" fr="S'ouvre dans un nouvel onglet" />
      </span>
      <nav className="social-links" aria-labelledby={labelId}>
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby={newTabId}
          >
            <Image
              src={platform.logo}
              width={20}
              height={20}
              alt=""
              className={
                platform.name === "WhatsApp"
                  ? "social-logo whatsapp-logo"
                  : "social-logo"
              }
            />
            <span>{platform.name}</span>
          </a>
        ))}
        <a
          href={profile.playStore}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby={newTabId}
        >
          <Play size={20} aria-hidden="true" />
          <span>Google Play</span>
        </a>
        <a href={`mailto:${profile.email}`}>
          <Mail size={20} aria-hidden="true" />
          <span>Email</span>
        </a>
      </nav>
    </>
  );
}
