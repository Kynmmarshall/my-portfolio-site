"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Boxes,
  Database,
  GitBranch,
  Monitor,
  Server,
  ShieldCheck,
} from "lucide-react";

const flows = {
  application: [
    {
      icon: Monitor,
      title: "Flutter + Provider",
      description:
        "Cross-platform screens, state management, and recipe discovery.",
    },
    {
      icon: Server,
      title: "Node.js + Express",
      description:
        "Documented REST service boundaries for recipes, profiles, and authentication.",
    },
    {
      icon: Database,
      title: "PostgreSQL",
      description:
        "Relational persistence for users, recipes, and saved favourites.",
    },
  ],
  delivery: [
    {
      icon: GitBranch,
      title: "Source repository",
      description:
        "The shared application source and versioned Jenkins pipeline.",
    },
    {
      icon: ShieldCheck,
      title: "Analysis + tests",
      description:
        "Flutter analysis, automated tests, and coverage report generation.",
    },
    {
      icon: Boxes,
      title: "Build + package",
      description:
        "Android APK and App Bundle creation, with archived build artifacts.",
    },
    {
      icon: Server,
      title: "VPS delivery",
      description:
        "The documented pipeline copies the website and release artifacts into the hosted project directory.",
    },
  ],
};
export function ArchitectureExplorer() {
  const [mode, setMode] = useState<keyof typeof flows>("application");
  return (
    <section className="architecture-explorer">
      <div className="architecture-heading">
        <div>
          <p className="eyebrow">DOCUMENTED ARCHITECTURE</p>
          <h2>How the parts connect.</h2>
        </div>
        <div className="segmented" role="group" aria-label="Architecture view">
          <button
            aria-pressed={mode === "application"}
            onClick={() => setMode("application")}
          >
            Application
          </button>
          <button
            aria-pressed={mode === "delivery"}
            onClick={() => setMode("delivery")}
          >
            Delivery
          </button>
        </div>
      </div>
      <ol className="architecture-flow">
        {flows[mode].map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <span className="architecture-icon">
                <Icon size={22} />
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < flows[mode].length - 1 && (
                <ArrowDown className="flow-arrow" size={14} />
              )}
            </li>
          );
        })}
      </ol>
      <a
        className="text-link"
        href="https://github.com/Kynmmarshall/Pick-My-Dish"
        target="_blank"
        rel="noreferrer"
      >
        Source documentation <ArrowUpRight size={14} />
      </a>
    </section>
  );
}
