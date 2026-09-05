import Image from "next/image";
import { Mail } from "lucide-react";
import { profile } from "@/content/profile";
import githubLogo from "@/images/github.png";
import linkedinLogo from "@/images/LinkedIn.png";
import itchLogo from "@/images/itch.png";

const platforms = [
  { name: "GitHub", url: profile.github, logo: githubLogo },
  { name: "LinkedIn", url: profile.linkedin, logo: linkedinLogo },
  { name: "itch.io", url: profile.itch, logo: itchLogo },
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
          title={`${platform.name} profile (opens in a new tab)`}
        >
          <Image
            src={platform.logo}
            width={20}
            height={20}
            alt=""
            className="social-logo"
          />
          <span>{platform.name}</span>
        </a>
      ))}
      <a href={`mailto:${profile.email}`} title={`Email ${profile.email}`}>
        <Mail size={20} aria-hidden="true" />
        <span>Email</span>
      </a>
    </nav>
  );
}
