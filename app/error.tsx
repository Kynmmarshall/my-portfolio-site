"use client";
import { T } from "@/components/i18n/T";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell prose-page">
      <p className="eyebrow">
        <T en="SOMETHING WENT WRONG" fr="QUELQUE CHOSE S'EST MAL PASSÉ" />
      </p>
      <h1>
        <T en="A small interruption." fr="Une petite interruption." />
      </h1>
      <p>
        <T
          en="Please try again, or reach me at kynmmarshall@gmail.com."
          fr="Veuillez réessayer, ou écrivez-moi à kynmmarshall@gmail.com."
        />
      </p>
      <button className="button button-dark" onClick={reset}>
        <T en="Try again" fr="Réessayer" />
      </button>
    </div>
  );
}
