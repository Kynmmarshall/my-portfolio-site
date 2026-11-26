"use client";

import dynamic from "next/dynamic";

// Client-only: the WebGL scene must not be prerendered, and `ssr: false` is only
// valid inside a Client Component.
const KeyboardBackground = dynamic(
  () => import("@/components/three/KeyboardBackground"),
  { ssr: false },
);

export function ReactiveBackground() {
  return <KeyboardBackground />;
}
