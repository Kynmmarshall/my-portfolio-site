import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { T } from "@/components/i18n/T";

export default function NotFound() {
  return (
    <div className="shell prose-page">
      <p className="eyebrow">
        <T en="404 / NOT FOUND" fr="404 / INTROUVABLE" />
      </p>
      <h1>
        <T en="This route ends here." fr="Cette route s'arrête ici." />
      </h1>
      <p>
        <T
          en="The project or page you're looking for isn't in this collection."
          fr="Le projet ou la page que vous cherchez ne fait pas partie de cette collection."
        />
      </p>
      <Link href="/projects" className="button button-dark">
        <ArrowLeft size={16} />{" "}
        <T en="Back to the work" fr="Retour aux projets" />
      </Link>
    </div>
  );
}
