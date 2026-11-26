import Image from "next/image";
import Link from "next/link";
import { T } from "@/components/i18n/T";
import { SocialLinks } from "./SocialLinks";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Image src="/media/profile/portrait.webp" alt="" fill sizes="33px" />
          </span>
          kynmmarshall<span className="brand-dot">.</span>
        </Link>
        <p>
          <T
            en="Thoughtfully built. Always evolving."
            fr="Conçu avec soin. Toujours en évolution."
          />
        </p>
      </div>
      <div className="footer-links">
        <SocialLinks
          id="footer-social"
          label={{ en: "Social profiles", fr: "Profils sociaux" }}
        />
        <Link href="/privacy">
          <T en="Privacy" fr="Confidentialité" />
        </Link>
      </div>
      <span className="copyright">
        © {new Date().getFullYear()} K. Marshall
      </span>
    </footer>
  );
}
