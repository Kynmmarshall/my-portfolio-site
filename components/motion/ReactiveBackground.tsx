"use client";

import dynamic from "next/dynamic";

const TerrainBackground = dynamic(
  () => import("@/components/three/TerrainBackground"),
  { ssr: false },
);

export function ReactiveBackground() {
  return <TerrainBackground />;
}
