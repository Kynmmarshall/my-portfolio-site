"use client";

import { useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, type Group, type Mesh, type MeshBasicMaterial } from "three";
import type { MeshPhysicalMaterial, WebGLProgramParametersWithUniforms } from "three";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import type { sceneBudget } from "@/lib/visuals/scene-performance";

type Budget = ReturnType<typeof sceneBudget>;

const PALETTE = {
  light: {
    body: "#e4f1e8",
    attenuation: "#2f9f86",
    accent: "#147668",
    key: "#ffffff",
    fill: "#cfe7d8",
  },
  dark: {
    body: "#9adfcd",
    attenuation: "#0f5f57",
    accent: "#80d8c4",
    key: "#dff6ec",
    fill: "#1d4f46",
  },
} as const;

export function GlassSculpture({
  budget,
  theme,
  onFirstFrame,
}: {
  budget: Budget;
  theme: "light" | "dark";
  onFirstFrame?: () => void;
}) {
  const group = useRef<Group>(null);
  const body = useRef<MeshPhysicalMaterial>(null);
  const accent = useRef<Mesh>(null);
  const accentMaterial = useRef<MeshBasicMaterial>(null);
  const drift = useRef(0);
  const smoothed = useRef({ x: 0, y: 0 });
  const drawn = useRef(false);
  // Shared with the injected vertex shader; mutated per frame, never reallocated.
  const uniforms = useRef({ uTime: { value: 0 }, uMorph: { value: 0 } });
  const controller = useSceneMotion();
  const palette = PALETTE[theme];

  // Displacement runs entirely on the GPU. Flat shading lets Three derive normals
  // from screen-space derivatives, so the displaced surface stays correctly lit
  // without rebuilding vertex normals on the CPU.
  const compile = useCallback(
    (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uTime = uniforms.current.uTime;
      shader.uniforms.uMorph = uniforms.current.uMorph;
      shader.vertexShader =
        "uniform float uTime;\nuniform float uMorph;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           float swell = sin(position.x * 1.7 + uTime * 0.85)
                       * cos(position.y * 1.5 - uTime * 0.65)
                       + sin(position.z * 2.05 + uTime * 0.45) * 0.5;
           transformed += normal * swell * uMorph * 0.24;`,
        );
    },
    [],
  );

  useFrame((state, delta) => {
    const mesh = group.current;
    const material = body.current;
    if (!mesh || !material) return;    const pose = controller.pose;
    const input = controller.readInput();
    const step = Math.min(delta, 0.06);
    if (controller.isAmbient()) drift.current += step;

    const compact = state.size.width < 768;
    // Narrow viewports pull the sculpture into the right edge and below the
    // headline, so it stays a cropped accent rather than a wash behind the text.
    const spread = compact ? 0.4 : 1;

    // Input is eased here rather than tweened, so the scroll timeline and the
    // pointer offset never write the same value from two different owners.
    const easing = 1 - Math.exp(-step * 3.4);
    smoothed.current.x += (input.x - smoothed.current.x) * easing;
    smoothed.current.y += (input.y - smoothed.current.y) * easing;

    const float = Math.sin(drift.current * 0.55) * 0.12;
    mesh.position.set(
      pose.positionX * spread + smoothed.current.x * 0.42,
      pose.positionY + float + (compact ? -0.35 : 0) - smoothed.current.y * 0.22,
      pose.positionZ,
    );
    mesh.rotation.set(
      pose.rotationX + smoothed.current.y * 0.2 + drift.current * 0.045,
      pose.rotationY + smoothed.current.x * 0.32 + drift.current * 0.09,
      pose.rotationZ,
    );
    mesh.scale.setScalar(pose.scale * (compact ? 0.55 : 1));

    uniforms.current.uTime.value = drift.current;
    uniforms.current.uMorph.value = pose.morph * pose.presence;

    material.opacity = MathUtils.clamp(0.46 + pose.presence * 0.5, 0, 1);
    material.thickness = 0.9 + pose.transmission * 1.4;
    if (budget.transmission)
      material.transmission = MathUtils.clamp(
        0.25 + pose.transmission * 0.7,
        0.05,
        1,
      );

    const line = accentMaterial.current;
    if (line) {
      line.opacity = pose.accent * pose.presence * 0.3;
      if (accent.current) accent.current.visible = line.opacity > 0.01;
    }

    const camera = state.camera;
    camera.position.set(pose.cameraX, pose.cameraY, pose.cameraZ);
    camera.lookAt(pose.targetX, pose.targetY, 0);

    if (!drawn.current) {
      drawn.current = true;
      onFirstFrame?.();
    }
  });

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.55 : 0.85} />
      <directionalLight
        position={[4, 5, 6]}
        intensity={theme === "dark" ? 2.3 : 2.8}
        color={palette.key}
      />
      <directionalLight
        position={[-5, -2, -3]}
        intensity={theme === "dark" ? 1.1 : 1.3}
        color={palette.fill}
      />
      {/* Studio reflections rendered once from local geometry: no HDR download. */}
      {budget.transmission && (
        <Environment frames={1} resolution={128}>
          <Lightformer
            intensity={theme === "dark" ? 1.6 : 2.4}
            position={[0, 4, -6]}
            scale={[10, 6, 1]}
            color={palette.key}
          />
          <Lightformer
            intensity={1.2}
            position={[-6, 1, 2]}
            scale={[6, 6, 1]}
            color={palette.accent}
          />
          <Lightformer
            intensity={0.9}
            position={[6, -2, 3]}
            scale={[6, 4, 1]}
            color={palette.fill}
          />
        </Environment>
      )}
      <group ref={group}>
        <mesh>
          <torusKnotGeometry
            args={[1, 0.32, budget.tubularSegments, budget.radialSegments]}
          />
          <meshPhysicalMaterial
            ref={body}
            flatShading
            transparent
            metalness={0}
            roughness={0.09}
            clearcoat={1}
            clearcoatRoughness={0.16}
            iridescence={1}
            iridescenceIOR={1.35}
            iridescenceThicknessRange={[120, 520]}
            ior={1.36}
            thickness={1.5}
            // Held above zero on the transmissive tier so scroll-driven changes
            // never cross the threshold that forces a shader recompile mid-scroll.
            transmission={budget.transmission ? 0.6 : 0}
            attenuationDistance={2.4}
            attenuationColor={palette.attenuation}
            envMapIntensity={1.15}
            color={palette.body}
            onBeforeCompile={compile}
          />
        </mesh>
        {budget.accentTubularSegments > 0 && (
          <mesh ref={accent}>
            <torusKnotGeometry
              args={[
                1.04,
                0.35,
                budget.accentTubularSegments,
                budget.accentRadialSegments,
              ]}
            />
            <meshBasicMaterial
              ref={accentMaterial}
              wireframe
              transparent
              depthWrite={false}
              toneMapped={false}
              color={palette.accent}
            />
          </mesh>
        )}
      </group>
    </>
  );
}
