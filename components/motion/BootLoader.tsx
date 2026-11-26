"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { T } from "@/components/i18n/T";
import {
  BOOT_EXIT_MS,
  BOOT_TICK_MS,
  bootProgress,
  reachedSteps,
} from "@/lib/visuals/boot-sequence";
import {
  getSceneLoadingSnapshot,
  getServerSceneLoadingSnapshot,
  subscribeSceneLoading,
} from "@/lib/visuals/scene-loading";

/**
 * Developer-style boot splash.
 *
 * It is server-rendered so it covers the page from the first paint, driven by the
 * real scene-loading state, and removed once the sequence finishes. It is purely
 * decorative (`aria-hidden`); assistive technology reads the page and the
 * existing scene status. Reduced motion, repeat visits in the same tab and
 * visitors without JavaScript never see it (see the `boot-loader` rules in the
 * stylesheet and the inline script in the layout).
 */
export function BootLoader() {
  const { phase } = useSyncExternalStore(
    subscribeSceneLoading,
    getSceneLoadingSnapshot,
    getServerSceneLoadingSnapshot,
  );
  const [clock, setClock] = useState({ ticks: 0, waited: 0 });
  const [gone, setGone] = useState(false);
  const startedAt = useRef(0);
  const progress = bootProgress(clock.ticks * BOOT_TICK_MS, phase, clock.waited);
  const done = progress >= 100;

  useEffect(() => {
    if (done) return;
    if (!startedAt.current) startedAt.current = performance.now();
    const timer = setInterval(
      () =>
        setClock((current) => ({
          ticks: current.ticks + 1,
          waited: performance.now() - startedAt.current,
        })),
      BOOT_TICK_MS,
    );
    return () => clearInterval(timer);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    try {
      sessionStorage.setItem("boot-seen", "1");
    } catch {
      // Storage can be blocked; the splash then simply plays on every full load.
    }
    const timer = setTimeout(() => setGone(true), BOOT_EXIT_MS);
    return () => clearTimeout(timer);
  }, [done]);

  if (gone) return null;
  const steps = reachedSteps(progress);
  const seconds = (clock.ticks * BOOT_TICK_MS) / 1000;
  return (
    <div
      className="boot-loader"
      data-state={done ? "done" : "booting"}
      aria-hidden="true"
    >
      <div className="boot-window">
        <div className="boot-titlebar">
          <span className="boot-dot" />
          <span className="boot-dot" />
          <span className="boot-dot" />
          <b>kynmmarshall: zsh</b>
        </div>
        <div className="boot-body">
          <p className="boot-line boot-command">
            <span className="boot-path">~/portfolio</span>
            <span className="boot-dollar">$</span> npm run dev
          </p>
          {steps.map((step, index) => {
            const active = !done && index === steps.length - 1;
            return (
              <p key={step.label} className="boot-line" data-active={active}>
                <span className="boot-mark">{active ? "›" : "✓"}</span>
                <T en={step.label} fr={step.fr} />
                {active && <i className="boot-caret" />}
              </p>
            );
          })}
          {done && (
            <p className="boot-line boot-ready">
              <span className="boot-mark">✓</span>
              <T
                en={`ready in ${seconds.toFixed(1)}s`}
                fr={`prêt en ${seconds.toFixed(1).replace(".", ",")} s`}
              />
            </p>
          )}
        </div>
        <div className="boot-meter">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="boot-foot">
          <span>{String(progress).padStart(3, " ")}%</span>
          <kbd className="boot-key" data-down={done ? "true" : "false"}>
            <T en="↵ enter" fr="↵ entrée" />
          </kbd>
        </div>
      </div>
      <p className="boot-sign">
        <T
          en="Kamdeu Yamdjeuson Neil Marshall / software engineer"
          fr="Kamdeu Yamdjeuson Neil Marshall / ingénieur logiciel"
        />
      </p>
    </div>
  );
}
