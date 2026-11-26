"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { profile } from "@/content/profile";
import { T } from "@/components/i18n/T";
import { useText } from "@/hooks/useLocale";
import type { Localized } from "@/lib/i18n";
import whatsappLogo from "@/images/whatsapp.png";

const INTENTS = [
  { key: "project", label: { en: "A project", fr: "Un projet" } },
  { key: "role", label: { en: "A role", fr: "Un poste" } },
  {
    key: "collaboration",
    label: { en: "A collaboration", fr: "Une collaboration" },
  },
] as const satisfies readonly { key: string; label: Localized }[];

export function ContactSection() {
  const [intentKey, setIntentKey] = useState<(typeof INTENTS)[number]["key"]>(
    INTENTS[0].key,
  );
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const t = useText();
  const intent = INTENTS.find((option) => option.key === intentKey)!;
  const subject = `${t(intent.label)} / ${t({ en: "Portfolio inquiry", fr: "Demande depuis le portfolio" })}`;
  const gmailQuery = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: profile.email,
    su: subject,
  });
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }
  const copiedText = t({ en: "Email copied", fr: "E-mail copié" });
  let status = "";
  if (copied) status = copiedText;
  else if (copyFailed)
    status = t({
      en: "Copy unavailable. Use the email link.",
      fr: "Copie impossible. Utilisez le lien e-mail.",
    });
  return (
    <section id="contact" className="contact-section" data-scene="contact">
      <div className="shell contact-inner">
        <div>
          <p className="eyebrow">
            <span /> <T en="WHAT'S NEXT?" fr="ET MAINTENANT ?" />
          </p>
          <h2>
            <T
              en={
                <>
                  Good work starts
                  <br />
                  with a conversation<span className="accent-text">.</span>
                </>
              }
              fr={
                <>
                  Un bon travail commence
                  <br />
                  par une conversation<span className="accent-text">.</span>
                </>
              }
            />
          </h2>
          <p>
            <T
              en={
                <>
                  A product to build, a team to join, or an interesting problem.
                  <br className="desktop-break" /> I&apos;d love to hear what
                  you have in mind.
                </>
              }
              fr={
                <>
                  Un produit à construire, une équipe à rejoindre ou un
                  problème intéressant.
                  <br className="desktop-break" /> J&apos;aimerais savoir ce
                  que vous avez en tête.
                </>
              }
            />
          </p>
        </div>
        <div className="contact-actions">
          <fieldset className="intent-picker">
            <legend>
              <T en="Let's talk about" fr="Parlons de" />
            </legend>
            {INTENTS.map((option) => (
              <label key={option.key}>
                <input
                  type="radio"
                  name="intent"
                  value={option.key}
                  checked={intentKey === option.key}
                  onChange={() => setIntentKey(option.key)}
                />
                <span>
                  <T en={option.label.en} fr={option.label.fr} />
                </span>
              </label>
            ))}
          </fieldset>
          <a
            className="button button-dark"
            href={`mailto:${profile.email}?subject=${encodeURIComponent(subject)}`}
          >
            <Mail size={18} /> <T en="Get in touch" fr="Me contacter" />{" "}
            <ArrowUpRight size={18} />
          </a>
          <a
            href={`https://mail.google.com/mail/?${gmailQuery}`}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail size={15} />{" "}
            <T en="Compose in Gmail" fr="Écrire dans Gmail" />{" "}
            <ArrowUpRight size={15} />
          </a>
          <div className="email-row">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button
              className="icon-button"
              onClick={copyEmail}
              aria-label={
                copied
                  ? copiedText
                  : t({ en: "Copy email address", fr: "Copier l'adresse e-mail" })
              }
              title={t({ en: "Copy email", fr: "Copier l'e-mail" })}
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </button>
          </div>
          <span className="sr-only" role="status">
            {status}
          </span>
          <a
            href={profile.whatsapp}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={whatsappLogo}
              alt=""
              width={20}
              height={20}
              className="whatsapp-logo"
            />
            WhatsApp: {profile.phoneDisplay} <ArrowUpRight size={15} />
          </a>
          <Link href="/resume" className="text-link">
            <T en="View engineering profile" fr="Voir le profil d'ingénieur" />{" "}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
