"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { profile } from "@/content/profile";

export function ContactSection() {
  const [intent, setIntent] = useState("A project");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyFailed(false); } catch { setCopyFailed(true); }
  }
  return <section id="contact" className="contact-section"><div className="shell contact-inner"><div><p className="eyebrow"><span /> WHAT&apos;S NEXT?</p><h2>Good work starts<br />with a conversation<span className="accent-text">.</span></h2><p>A product to build, a team to join, or an interesting problem.<br className="desktop-break" /> I&apos;d love to hear what you have in mind.</p></div><div className="contact-actions"><fieldset className="intent-picker"><legend>Let&apos;s talk about</legend>{["A project", "A role", "A collaboration"].map((option) => <label key={option}><input type="radio" name="intent" value={option} checked={intent === option} onChange={() => setIntent(option)} /><span>{option}</span></label>)}</fieldset><a className="button button-dark" href={`mailto:${profile.email}?subject=${encodeURIComponent(`${intent} / Portfolio inquiry`)}`}><Mail size={18} /> Get in touch <ArrowUpRight size={18} /></a><div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="icon-button" onClick={copyEmail} aria-label={copied ? "Email copied" : "Copy email address"} title="Copy email">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div><span className="sr-only" role="status">{copied ? "Email copied" : copyFailed ? "Copy unavailable. Use the email link." : ""}</span><Link href="/resume" className="text-link">View engineering profile <ArrowUpRight size={15} /></Link></div></div></section>;
}