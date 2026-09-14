"use client";

import dynamic from "next/dynamic";

// Client-only: the WebGL scene must not be prerendered, and `ssr: false` is only
// valid inside a Client Component.
const GlassBackground = dynamic(
  () => import("@/components/three/GlassBackground"),
  { ssr: false },
);

export function ReactiveBackground() {
  return <GlassBackground />;
}
