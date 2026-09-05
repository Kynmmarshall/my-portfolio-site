import Link from "next/link";
import { SocialLinks } from "./SocialLinks";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div>
        <Link href="/" className="brand">
          kynmmarshall<span className="brand-dot">.</span>
        </Link>
        <p>Thoughtfully built. Always evolving.</p>
      </div>
      <div className="footer-links">
        <SocialLinks label="Social profiles" />
        <Link href="/privacy">Privacy</Link>
      </div>
      <span className="copyright">
        © {new Date().getFullYear()} K. Marshall
      </span>
    </footer>
  );
}
