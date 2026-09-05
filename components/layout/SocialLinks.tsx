import Image from "next/image";
import { Mail, Play } from "lucide-react";
import { profile } from "@/content/profile";
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

export function SocialLinks({ label }: { label: string }) {
  return (
    <nav className="social-links" aria-label={label}>
      {platforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${platform.name} (opens in a new tab)`}
        >
          <Image
            src={platform.logo}
            width={20}
            height={20}
            alt=""
            className={platform.name === "WhatsApp" ? "social-logo whatsapp-logo" : "social-logo"}
          />
          <span>{platform.name}</span>
        </a>
      ))}
      <a
        href={profile.playStore}
        target="_blank"
        rel="noopener noreferrer"
        title="Google Play developer profile (opens in a new tab)"
      >
        <Play size={20} aria-hidden="true" />
        <span>Google Play</span>
      </a>
      <a href={`mailto:${profile.email}`} title={`Email ${profile.email}`}>
        <Mail size={20} aria-hidden="true" />
        <span>Email</span>
      </a>
    </nav>
  );
}
