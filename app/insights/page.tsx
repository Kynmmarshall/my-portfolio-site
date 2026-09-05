import type { Metadata } from "next";
import { ArrowUpRight, Code2, GitCommitHorizontal, Star } from "lucide-react";
import { readInsights } from "@/lib/server/insights";
import { LanguageBreakdown } from "@/components/insights/LanguageBreakdown";
import { ActivityCharts } from "@/components/insights/ActivityCharts";

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
    <div className="shell insights-page">
      <div className="page-heading">
        <p className="eyebrow">
          <span /> DEVELOPER OBSERVATORY
        </p>
        <h1>
          Behind the commits<span className="accent-text">.</span>
        </h1>
        <p>
          A public view of my repository activity and the languages behind my
          projects. Real data, with its context intact.
        </p>
      </div>
      <div className="snapshot-strip">
        <span className={`snapshot-indicator ${snapshot.state}`} />
        {snapshot.collectedAt
          ? `${snapshot.state === "stale" ? "Stale snapshot" : "Last collected"}: ${new Date(snapshot.collectedAt).toUTCString()}`
          : "Awaiting the first successful GitHub refresh"}
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
          <span>Public repositories</span>
        </div>
        <div>
          <Star size={20} />
          <strong>{data?.stars ?? "--"}</strong>
          <span>Stars across public repositories</span>
        </div>
        <div>
          <GitCommitHorizontal size={20} />
          <strong>{data?.contributions?.toLocaleString() ?? "--"}</strong>
          <span>GitHub contributions / trailing year</span>
        </div>
      </div>
      <section className="analytics-section">
        <div className="analytics-heading">
          <h2>Language landscape</h2>
          <span className="mono">
            {data?.includedRepositories ?? "--"} INCLUDED REPOSITORIES
          </span>
        </div>
        {data?.languages.length ? (
          <LanguageBreakdown languages={data.languages} />
        ) : (
          <div className="data-empty">
            <Code2 />
            <p>Language data is not available yet.</p>
          </div>
        )}
        <p className="data-note">
          Share of GitHub Linguist bytes across owned, public, non-fork,
          non-archived repositories. This is code distribution, not proficiency
          or time spent.{" "}
          {data?.partial
            ? "This snapshot is partial because some repository requests failed."
            : ""}
        </p>
      </section>
      <section className="analytics-section">
        <div className="analytics-heading">
          <h2>Developer activity</h2>
          <span className="mono">TRAILING YEAR</span>
        </div>
        <ActivityCharts days={data?.days ?? []} />
      </section>
      <details className="data-details methodology">
        <summary>Data sources & methodology</summary>
        <p>
          Repository metadata and language bytes come from GitHub REST.
          Contributions come from the GitHub GraphQL contribution calendar and
          follow GitHub&apos;s counting rules, which may include anonymized
          private contributions if enabled on the public profile. They are not a
          measure of working hours, productivity, or experience.
        </p>
        <p>
          GitHub data is fetched on the server and cached. Requests trigger
          background revalidation after six hours; a failed refresh preserves
          the previous cached snapshot and its original timestamp. Snapshots
          older than 24 hours are labeled stale. A missing value is never
          treated as zero.
        </p>
      </details>
    </div>
  );
}
