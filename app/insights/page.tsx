import type { Metadata } from "next";
import { ArrowUpRight, Code2, GitCommitHorizontal, Star } from "lucide-react";
import { readInsights } from "@/lib/server/insights";
import { LanguageBreakdown } from "@/components/insights/LanguageBreakdown";
import { ActivityCharts } from "@/components/insights/ActivityCharts";
import { NumberText, T, UtcDateTimeText } from "@/components/i18n/T";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;
export const metadata: Metadata = {
  title: "Developer insights",
  description:
    "Public repository language distribution and GitHub developer activity with transparent data sources.",
};
export default async function InsightsPage() {
  const snapshot = await readInsights();
  const data = snapshot.data;
  return (
    <div className="shell insights-page" data-scene="analytics">
      <div className="page-heading">
        <p className="eyebrow">
          <span />{" "}
          <T en="DEVELOPER OBSERVATORY" fr="OBSERVATOIRE DU DÉVELOPPEUR" />
        </p>
        <h1>
          <T
            en={
              <>
                Behind the commits<span className="accent-text">.</span>
              </>
            }
            fr={
              <>
                Derrière les commits<span className="accent-text">.</span>
              </>
            }
          />
        </h1>
        <p>
          <T
            en="A public view of my repository activity and the languages behind my projects. Real data, with its context intact."
            fr="Un aperçu public de l'activité de mes dépôts et des langages derrière mes projets. Des données réelles, avec leur contexte intact."
          />
        </p>
      </div>
      <div className="snapshot-strip">
        <span className={`snapshot-indicator ${snapshot.state}`} />
        {snapshot.collectedAt ? (
          <>
            {snapshot.state === "stale" ? (
              <T en="Stale snapshot" fr="Instantané périmé" />
            ) : (
              <T en="Last collected" fr="Dernière collecte" />
            )}
            <T en=": " fr=" : " />
            <UtcDateTimeText iso={snapshot.collectedAt} />
          </>
        ) : (
          <T
            en="Awaiting the first successful GitHub refresh"
            fr="En attente de la première actualisation GitHub réussie"
          />
        )}
        <a
          href="https://github.com/Kynmmarshall"
          target="_blank"
          rel="noreferrer"
        >
          Source <ArrowUpRight size={13} />
        </a>
      </div>
      <div className="metric-row">
        <div>
          <Code2 size={20} />
          <strong>{data?.repositories ?? "--"}</strong>
          <span>
            <T en="Public repositories" fr="Dépôts publics" />
          </span>
        </div>
        <div>
          <Star size={20} />
          <strong>{data?.stars ?? "--"}</strong>
          <span>
            <T
              en="Stars across public repositories"
              fr="Étoiles sur les dépôts publics"
            />
          </span>
        </div>
        <div>
          <GitCommitHorizontal size={20} />
          <strong>
            {data?.contributions == null ? (
              "--"
            ) : (
              <NumberText value={data.contributions} />
            )}
          </strong>
          <span>
            <T
              en="GitHub contributions / trailing year"
              fr="Contributions GitHub / 12 derniers mois"
            />
          </span>
        </div>
      </div>
      <section className="analytics-section">
        <div className="analytics-heading">
          <h2>
            <T en="Language landscape" fr="Paysage des langages" />
          </h2>
          <span className="mono">
            {data?.includedRepositories ?? "--"}{" "}
            <T en="INCLUDED REPOSITORIES" fr="DÉPÔTS INCLUS" />
          </span>
        </div>
        {data?.languages.length ? (
          <LanguageBreakdown languages={data.languages} />
        ) : (
          <div className="data-empty">
            <Code2 />
            <p>
              <T
                en="Language data is not available yet."
                fr="Les données de langages ne sont pas encore disponibles."
              />
            </p>
          </div>
        )}
        <p className="data-note">
          <T
            en="Share of GitHub Linguist bytes across owned, public, non-fork, non-archived repositories. This is code distribution, not proficiency or time spent."
            fr="Part des octets mesurés par GitHub Linguist sur mes dépôts publics, non forkés et non archivés. Il s'agit d'une répartition du code, pas d'un niveau de maîtrise ni d'un temps passé."
          />{" "}
          {data?.partial && (
            <T
              en="This snapshot is partial because some repository requests failed."
              fr="Cet instantané est partiel car certaines requêtes de dépôts ont échoué."
            />
          )}
        </p>
      </section>
      <section className="analytics-section">
        <div className="analytics-heading">
          <h2>
            <T en="Developer activity" fr="Activité de développement" />
          </h2>
          <span className="mono">
            <T en="TRAILING YEAR" fr="12 DERNIERS MOIS" />
          </span>
        </div>
        <ActivityCharts days={data?.days ?? []} />
      </section>
      <details className="data-details methodology">
        <summary>
          <T
            en="Data sources & methodology"
            fr="Sources des données et méthodologie"
          />
        </summary>
        <p>
          <T
            en="Repository metadata and language bytes come from GitHub REST. Contributions come from the GitHub GraphQL contribution calendar and follow GitHub's counting rules, which may include anonymized private contributions if enabled on the public profile. They are not a measure of working hours, productivity, or experience."
            fr="Les métadonnées des dépôts et les octets par langage proviennent de l'API REST de GitHub. Les contributions proviennent du calendrier de contributions GraphQL de GitHub et suivent ses règles de comptage, qui peuvent inclure des contributions privées anonymisées si cette option est activée sur le profil public. Elles ne mesurent ni les heures de travail, ni la productivité, ni l'expérience."
          />
        </p>
        <p>
          <T
            en="GitHub data is fetched on the server and cached. Requests trigger background revalidation after six hours; a failed refresh preserves the previous cached snapshot and its original timestamp. Snapshots older than 24 hours are labeled stale. A missing value is never treated as zero."
            fr="Les données GitHub sont récupérées côté serveur puis mises en cache. Les requêtes déclenchent une revalidation en arrière-plan après six heures ; une actualisation échouée conserve l'instantané précédent et son horodatage d'origine. Les instantanés de plus de 24 heures sont signalés comme périmés. Une valeur manquante n'est jamais traitée comme zéro."
          />
        </p>
      </details>
    </div>
  );
}
