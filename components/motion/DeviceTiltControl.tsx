"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Smartphone } from "lucide-react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";

const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(pointer: coarse)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const supported = () =>
  window.isSecureContext &&
  "DeviceOrientationEvent" in window &&
  window.matchMedia("(pointer: coarse)").matches;

export function DeviceTiltControl() {
  const available = useSyncExternalStore(subscribe, supported, () => false);
  const [enabled, setEnabled] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");
  const { paused, reducedMotion } = useVisualPreferences();
  const visible = usePageVisibility();
  useEffect(() => {
    if (!enabled || paused || reducedMotion || !visible) return;
    let baseline: { beta: number; gamma: number } | null = null;
    const tilt = (event: DeviceOrientationEvent) => {
      if (
        event.beta === null ||
        event.gamma === null ||
        !Number.isFinite(event.beta) ||
        !Number.isFinite(event.gamma)
      )
        return;
      baseline ??= { beta: event.beta, gamma: event.gamma };
      const horizontal = Math.max(
        -1,
        Math.min(1, (event.gamma - baseline.gamma) / 22),
      );
      const vertical = Math.max(
        -1,
        Math.min(1, (event.beta - baseline.beta) / 22),
      );
      const angle = ((window.screen.orientation?.angle ?? 0) * Math.PI) / 180;
      window.dispatchEvent(
        new CustomEvent("portfolio:tilt", {
          detail: {
            x: horizontal * Math.cos(angle) + vertical * Math.sin(angle),
            y: vertical * Math.cos(angle) - horizontal * Math.sin(angle),
          },
        }),
      );
    };
    const recalibrate = () => {
      baseline = null;
    };
    window.addEventListener("deviceorientation", tilt, { passive: true });
    window.screen.orientation?.addEventListener("change", recalibrate);
    return () => {
      window.removeEventListener("deviceorientation", tilt);
      window.screen.orientation?.removeEventListener("change", recalibrate);
      window.dispatchEvent(
        new CustomEvent("portfolio:tilt", { detail: { x: 0, y: 0 } }),
      );
    };
  }, [enabled, paused, reducedMotion, visible]);
  async function toggle() {
    if (enabled) {
      setEnabled(false);
      setMessage("Device tilt disabled.");
      return;
    }
    setRequesting(true);
    try {
      const orientation =
        window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        };
      if (
        orientation.requestPermission &&
        (await orientation.requestPermission()) !== "granted"
      ) {
        setMessage(
          "Device tilt permission was not granted. Scroll interaction remains available.",
        );
        return;
      }
      setEnabled(true);
      setMessage(
        "Device tilt enabled. Sensor availability depends on your browser and device.",
      );
    } catch {
      setMessage(
        "Device tilt is unavailable. Scroll interaction remains available.",
      );
    } finally {
      setRequesting(false);
    }
  }
  if (!available) return null;
  return (
    <span className="tilt-control">
      <button
        className="icon-button"
        onClick={toggle}
        disabled={paused || reducedMotion || requesting}
        aria-pressed={enabled}
        aria-label={enabled ? "Disable device tilt" : "Enable device tilt"}
        title={enabled ? "Disable device tilt" : "Enable device tilt"}
      >
        <Smartphone size={16} />
      </button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </span>
  );
}
