"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, GitBranch, Activity } from "lucide-react";
import {
  analyticsSchema,
  type Analytics,
  type Snapshot,
} from "@/lib/schemas/analytics";
import { LanguageBreakdown } from "./LanguageBreakdown";

export function InsightsPreview() {
  const root = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<Analytics> | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch("/api/insights", { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw new Error("Insights unavailable");
            return response.json();
          })
          .then((response) => {
            setSnapshot({
              ...response,
              data: response.data ? analyticsSchema.parse(response.data) : null,
            });
          })
          .catch(() => {
            if (!controller.signal.aborted)
              setSnapshot({
                state: "unavailable",
                collectedAt: null,
                data: null,
              });
          });
      },
      { rootMargin: "200px" },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, []);
  return (
    <div ref={root}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span /> THE WORK, IN NUMBERS
          </p>
          <h2>A look under the hood.</h2>
        </div>
        <Link href="/insights" className="text-link">
          Explore the insights <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="insights-preview">
        <div className="insight-numbers">
          <div>
            <Code2 size={19} />
            <strong>{snapshot?.data?.repositories ?? "--"}</strong>
            <span>Public repositories</span>
          </div>
          <div>
            <GitBranch size={19} />
            <strong>
              {snapshot?.data?.contributions?.toLocaleString() ?? "--"}
            </strong>
            <span>Yearly contributions</span>
          </div>
          <div>
            <Activity size={19} />
            <strong>04</strong>
            <span>Engineering disciplines</span>
          </div>
        </div>
        <div className="preview-languages">
          <h3>Languages in the codebase</h3>
          {snapshot?.data?.languages.length ? (
            <LanguageBreakdown languages={snapshot.data.languages} compact />
          ) : (
            <p className="data-note">
              {snapshot === null
                ? "Loading repository data..."
                : "Repository insights are awaiting a successful data refresh."}
            </p>
          )}
          <p className="data-note">
            {snapshot?.collectedAt
              ? `GitHub / ${snapshot.state === "stale" ? "stale snapshot" : "cached snapshot"} / ${snapshot.collectedAt.slice(0, 10)}`
              : "Source: public GitHub repositories"}
          </p>
        </div>
      </div>
    </div>
  );
}
