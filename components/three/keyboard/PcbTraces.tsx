"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type BufferGeometry, type ShaderMaterial } from "three";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { layerWeight, type KeyboardPalette } from "@/lib/visuals/keyboard-layout";
import { PCB_FRAGMENT, PCB_VERTEX } from "./pcb-shader";
import { useAmbientClock } from "./useAmbientClock";

/** Writes one shader uniform; kept outside the component so frame code stays plain assignment. */
function setUniform(material: ShaderMaterial | null, name: string, value: number) {
  const uniform = material?.uniforms[name];
  if (uniform) uniform.value = value;
}

function setColor(material: ShaderMaterial | null, name: string, hex: string) {
  material?.uniforms[name]?.value.set(hex);
}

/** The board's printed circuit: traces pulse, and glow harder when the board is the focus layer. */
export function PcbTraces({
  geometry,
  palette,
}: {
  geometry: BufferGeometry;
  palette: KeyboardPalette;
}) {
  const controller = useSceneMotion();
  const clock = useAmbientClock();
  const material = useRef<ShaderMaterial>(null);

  useEffect(() => {
    setColor(material.current, "uBoard", palette.board);
    setColor(material.current, "uTrace", palette.trace);
    setColor(material.current, "uWarm", palette.warm);
    controller.requestFrame();
  }, [controller, palette]);

  useFrame(() => {
    const pose = controller.pose;
    setUniform(material.current, "uTime", clock.current);
    setUniform(
      material.current,
      "uGlow",
      0.6 + pose.accent * 0.5 + layerWeight(pose.layer, 1) * 0.9,
    );
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={PCB_VERTEX}
        fragmentShader={PCB_FRAGMENT}
        uniforms={{
          uTime: { value: 0 },
          uGlow: { value: 1 },
          uBoard: { value: new Color() },
          uTrace: { value: new Color() },
          uWarm: { value: new Color() },
        }}
        toneMapped={false}
      />
    </mesh>
  );
}
