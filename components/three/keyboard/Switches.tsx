"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Object3D, type InstancedMesh, type MeshBasicMaterial } from "three";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import {
  buildSwitchGeometry,
  buildUnderglowGeometry,
} from "@/lib/visuals/keyboard-geometry";
import {
  KEY_COUNT,
  keyboardKeys,
  layerWeight,
  ledLevel,
  type KeyboardPalette,
} from "@/lib/visuals/keyboard-layout";
import { useAmbientClock } from "./useAmbientClock";
import type { PressedKeys } from "./PressedKeys";

const dummy = new Object3D();
const lit = new Color();

/** Static switches: one instanced draw, positioned once. */
export function Switches({ palette }: { palette: KeyboardPalette }) {
  const geometry = useMemo(() => buildSwitchGeometry(palette), [palette]);
  const mesh = useRef<InstancedMesh>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const instances = mesh.current;
    if (!instances) return;
    for (const key of keyboardKeys()) {
      dummy.position.set(key.x, 0, key.z);
      dummy.updateMatrix();
      instances.setMatrixAt(key.index, dummy.matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
  }, [geometry]);

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, KEY_COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial vertexColors roughness={0.55} metalness={0.1} />
    </instancedMesh>
  );
}

/** Light leaking out from under the caps: a slow wave, brightened by key presses. */
export function Underglow({
  palette,
  pressed,
}: {
  palette: KeyboardPalette;
  pressed: PressedKeys;
}) {
  const controller = useSceneMotion();
  const clock = useAmbientClock();
  const geometry = useMemo(() => buildUnderglowGeometry(), []);
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const base = useMemo(() => new Color(palette.led), [palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const instances = mesh.current;
    if (!instances) return;
    for (const key of keyboardKeys()) {
      dummy.position.set(key.x, 0, key.z);
      dummy.updateMatrix();
      instances.setMatrixAt(key.index, dummy.matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
  }, [geometry]);

  useFrame(() => {
    const instances = mesh.current;
    if (!instances) return;
    const pose = controller.pose;
    const strength = 0.3 + pose.accent * 0.35 + layerWeight(pose.layer, 3) * 0.6;
    for (const key of keyboardKeys()) {
      const level = ledLevel(clock.current, key.x, key.z, pressed.level(key.index));
      instances.setColorAt(key.index, lit.copy(base).multiplyScalar(level * strength));
    }
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, KEY_COUNT]}
      frustumCulled={false}
    >
      <meshBasicMaterial ref={material} toneMapped={false} />
    </instancedMesh>
  );
}
