import { T } from "@/components/i18n/T";

export default function LoadingInsights() {
  return (
    <div className="shell loading-state" role="status">
      <T
        en="Loading developer insights..."
        fr="Chargement des statistiques de développement..."
      />
    </div>
  );
}
