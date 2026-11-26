"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  InstancedBufferAttribute,
  Object3D,
  type InstancedMesh,
  type MeshStandardMaterial,
  type Texture,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { buildKeycapGeometry } from "@/lib/visuals/keyboard-geometry";
import {
  KEYCAP,
  KEY_COUNT,
  keyboardKeys,
  layerWeight,
  type KeyboardDetail,
  type KeyboardPalette,
} from "@/lib/visuals/keyboard-layout";
import { createLegendAtlas } from "./legend-atlas";
import type { PressedKeys } from "./PressedKeys";

const dummy = new Object3D();
const mixed = new Color();

/**
 * Instanced keycaps. A cap's legend is read from a small canvas atlas in the
 * fragment shader, so 83 different legends still cost a single draw call.
 */
export function Keycaps({
  detail,
  palette,
  pressed,
}: {
  detail: KeyboardDetail;
  palette: KeyboardPalette;
  pressed: PressedKeys;
}) {
  const controller = useSceneMotion();
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  // Shared with the injected shader; mutated per frame, never reallocated.
  const uniforms = useRef({
    uLegend: { value: null as Texture | null },
    uLegendGlow: { value: 0 },
  });

  const geometry = useMemo(() => {
    const built = buildKeycapGeometry(detail);
    built.setAttribute(
      "aLegend",
      new InstancedBufferAttribute(new Float32Array(KEY_COUNT * 4), 4),
    );
    return built;
  }, [detail]);

  const atlas = useMemo(
    () => createLegendAtlas(palette, detail.legendTile),
    [palette, detail.legendTile],
  );

  const colors = useMemo(
    () =>
      keyboardKeys().map((key) => ({
        base: new Color(palette[key.kind]),
        lit: new Color(key.kind === "accent" ? palette.warm : palette.trace),
      })),
    [palette],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const attribute = geometry.getAttribute("aLegend") as InstancedBufferAttribute;
    attribute.array.set(atlas.rects);
    attribute.needsUpdate = true;
    uniforms.current.uLegend.value = atlas.texture;
    const lifetime = { active: true };
    // The mono web font may arrive after the first paint of the atlas.
    document.fonts?.ready.then(() => {
      if (!lifetime.active) return;
      atlas.redraw(palette);
      controller.requestFrame();
    });
    controller.requestFrame();
    return () => {
      lifetime.active = false;
      atlas.dispose();
    };
  }, [atlas, controller, geometry, palette]);

  // Legend lookup and glow are injected into the standard material, which keeps
  // its lighting; the top face is found from the object-space normal.
  const compile = useCallback(
    (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uLegend = uniforms.current.uLegend;
      shader.uniforms.uLegendGlow = uniforms.current.uLegendGlow;
      shader.vertexShader = shader.vertexShader
        .replace(
          "void main() {",
          `attribute vec4 aLegend;
           varying vec2 vLegendUv;
           varying float vTop;
           void main() {`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vLegendUv = aLegend.xy + uv * aLegend.zw;
           vTop = step(0.7, normal.y);`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "void main() {",
          `uniform sampler2D uLegend;
           uniform float uLegendGlow;
           varying vec2 vLegendUv;
           varying float vTop;
           void main() {`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           vec4 legendTexel = texture2D(uLegend, vLegendUv);
           float legendMask = legendTexel.a * vTop;
           diffuseColor.rgb = mix(diffuseColor.rgb, legendTexel.rgb, legendMask);`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
           totalEmissiveRadiance += legendTexel.rgb * legendMask * uLegendGlow;`,
        );
    },
    [],
  );

  useFrame(() => {
    const instances = mesh.current;
    if (!instances) return;
    const pose = controller.pose;
    const gap = KEYCAP.gap;
    for (const key of keyboardKeys()) {
      const press = pressed.level(key.index);
      dummy.position.set(key.x, KEYCAP.y - press * KEYCAP.press, key.z);
      dummy.scale.set(key.width - gap, KEYCAP.height, 1 - gap);
      dummy.updateMatrix();
      instances.setMatrixAt(key.index, dummy.matrix);
      const pair = colors[key.index];
      instances.setColorAt(key.index, mixed.copy(pair.base).lerp(pair.lit, press));
    }
    instances.instanceMatrix.needsUpdate = true;
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
    uniforms.current.uLegendGlow.value =
      0.1 + pose.accent * 0.25 + layerWeight(pose.layer, 4) * 0.5;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, KEY_COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        ref={material}
        roughness={0.42}
        metalness={0.05}
        envMapIntensity={0.7}
        onBeforeCompile={compile}
      />
    </instancedMesh>
  );
}
