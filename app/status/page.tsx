import type { Metadata } from "next";
import { readStatus } from "@/lib/server/read-models";
import { StatusDashboard } from "@/components/status/StatusDashboard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Infrastructure status",
  description:
    "Timestamped HTTP reachability observations for Kynmmarshall's deployed projects.",
};
export default function StatusPage() {
  const snapshot = readStatus();
  return (
    <div className="shell status-page">
      <div className="page-heading">
        <p className="eyebrow">
          <span /> INFRASTRUCTURE OBSERVATORY
        </p>
        <h1>
          Out in the real world<span className="accent-text">.</span>
        </h1>
        <p>
          HTTP reachability for my deployed projects. Each observation is a
          small, timestamped check of its public website.
        </p>
      </div>
      <StatusDashboard initial={snapshot} renderedAt={snapshot.evaluatedAt} />
      <details className="data-details methodology" open>
        <summary>What these checks do, and don&apos;t, tell you</summary>
        <p>
          A successful HTTP response shows that a public page was reachable from
          this server. It does not prove that every application feature,
          database, or API is healthy. This observer cannot independently
          measure a failure of its own host.
        </p>
        <p>
          History is collected every five minutes when the monitoring job is
          scheduled. Missing intervals remain unknown. Availability is the
          proportion of successful classified checks, shown alongside
          observation coverage, after at least twelve observations. History is
          retained for up to 30 days.
        </p>
      </details>
    </div>
  );
}
