import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";

export function SiteFooter() {
  return <footer className="site-footer shell"><div><Link href="/" className="brand">kynmmarshall<span className="brand-dot">.</span></Link><p>Thoughtfully built. Always evolving.</p></div><div className="footer-links"><a href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a><a href={profile.itch} target="_blank" rel="noreferrer">itch.io <ArrowUpRight size={14} /></a><Link href="/privacy">Privacy</Link></div><span className="copyright">© {new Date().getFullYear()} K. Marshall</span></footer>;
}