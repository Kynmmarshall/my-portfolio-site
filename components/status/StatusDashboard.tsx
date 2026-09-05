"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Radio, Server } from "lucide-react";
import type { Snapshot } from "@/lib/schemas/analytics";
import {
  serviceTargets,
  INTERVAL_MS,
  type ServiceSummary,
} from "@/lib/monitoring/targets";

export function StatusDashboard({
  initial,
  renderedAt,
}: {
  initial: Snapshot<ServiceSummary[]>;
  renderedAt: number;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [now, setNow] = useState(renderedAt);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      if (document.hidden) return;
      setNow(Date.now());
      try {
        const response = await fetch("/api/status", {
          signal: controller.signal,
        });
        if (response.ok) setSnapshot(await response.json());
      } catch {
        return;
      }
    }
    const interval = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(interval);
      controller.abort();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const services =
    snapshot.data ??
    serviceTargets.map((target) => ({
      ...target,
      latest: null,
      recent: [],
      availability: null,
      observed: 0,
      expected: 0,
      coverage: 0,
      since: null,
    }));
  return (
    <>
      <div className="snapshot-strip">
        <Radio size={15} />
        {snapshot.collectedAt
          ? `Last observation: ${new Date(snapshot.collectedAt).toUTCString()}`
          : "No reachability observations collected yet"}
        <span className="mono">5 MINUTE CHECK INTERVAL</span>
      </div>
      <div className="service-list">
        {services.map((service) => {
          const stale = service.latest
            ? now - Date.parse(service.latest.checkedAt) > 600000
            : false;
          const state = stale ? "stale" : (service.latest?.result ?? "unknown");
          const slot = Math.floor(now / INTERVAL_MS);
          return (
            <article className="service-row" key={service.id}>
              <div className="service-name">
                <span className="service-icon">
                  <Server size={19} />
                </span>
                <div>
                  <h2>
                    <a href={service.url} target="_blank" rel="noreferrer">
                      {service.title} <ArrowUpRight size={16} />
                    </a>
                  </h2>
                  <span>{new URL(service.url).hostname}</span>
                </div>
                <span className={`service-state ${state}`}>
                  <i />
                  {state === "reachable"
                    ? "Reachable"
                    : state === "unreachable"
                      ? "Unreachable"
                      : state === "stale"
                        ? "Stale observation"
                        : "Not observed"}
                </span>
              </div>
              <div
                className="service-history"
                aria-label={`Recent reachability checks for ${service.title}`}
              >
                {Array.from({ length: 48 }, (_, index) => {
                  const sample = service.recent.find(
                    (entry) => entry.slot === slot - 47 + index,
                  );
                  return (
                    <span
                      key={index}
                      className={sample?.result ?? "unknown"}
                      title={
                        sample
                          ? `${sample.checkedAt}: ${sample.result}`
                          : "No observation"
                      }
                    />
                  );
                })}
              </div>
              <div className="service-foot">
                <span>
                  {service.latest?.latencyMs != null
                    ? `${service.latest.latencyMs} ms / HTTP ${service.latest.statusCode}`
                    : "Response time unavailable"}
                </span>
                <span>
                  {service.availability === null
                    ? `${service.observed} observations / collecting history`
                    : `${service.availability.toFixed(2)}% observed availability`}{" "}
                  <span className="coverage">
                    / {service.coverage.toFixed(0)}% coverage
                  </span>
                </span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="status-legend">
        <span>
          <i className="reachable" /> Reachable
        </span>
        <span>
          <i className="unreachable" /> Unreachable
        </span>
        <span>
          <i className="unknown" /> No observation
        </span>
      </div>
    </>
  );
}
