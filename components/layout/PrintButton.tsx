"use client";
import { Printer } from "lucide-react";
import { T } from "@/components/i18n/T";

export function PrintButton() {
  return (
    <button
      className="button button-light no-print"
      onClick={() => window.print()}
    >
      <Printer size={16} />{" "}
      <T en="Print / Save PDF" fr="Imprimer / Enregistrer en PDF" />
    </button>
  );
}
