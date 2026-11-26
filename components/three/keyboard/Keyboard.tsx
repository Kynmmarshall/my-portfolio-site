"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils, type Group, type PerspectiveCamera } from "three";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import {
  buildBoardGeometry,
  buildCaseGeometry,
  buildGlowGeometry,
  buildPlateGeometry,
  buildTraceGeometry,
} from "@/lib/visuals/keyboard-geometry";
import {
  KEYBOARD_PALETTE,
  LAYER_GAP,
  frameScale,
  layerLift,
  panLimits,
  presenceOpacity,
} from "@/lib/visuals/keyboard-layout";
import type { sceneBudget } from "@/lib/visuals/scene-performance";
import { Keycaps } from "./Keycaps";
import { PcbTraces } from "./PcbTraces";
import { PressedKeys } from "./PressedKeys";
import { Switches, Underglow } from "./Switches";
import { useAmbientClock } from "./useAmbientClock";
import { useRealTyping } from "./useRealTyping";

type Budget = ReturnType<typeof sceneBudget>;

/** Share of the exact cover scale used on wide screens; the desk mat fills the rest. */
const DESKTOP_FILL = 0.7;

/**
 * Shared pressed-key state. It updates ahead of every other frame callback
 * (negative priority adds no render pass) so the caps and the underglow read the
 * same values.
 */
function usePressedKeys() {
  const clock = useAmbientClock();
  const held = useRealTyping();
  const [pressed] = useState(() => new PressedKeys());
  useFrame((_state, delta) => {
    pressed.update(delta, clock.current, held.current);
  }, -1);
  return pressed;
}

/**
 * A mechanical keyboard, scaled to fill the viewport. The outer groups frame it
 * (cover scale, tilt, roll, pan); the five layer groups inside rise apart as the
 * explode amount grows, so scrolling takes the keyboard to pieces.
 */
export function Keyboard({
  budget,
  onFirstFrame,
}: {
  budget: Budget;
  onFirstFrame?: () => void;
}) {
  const controller = useSceneMotion();
  const pressed = usePressedKeys();
  const palette = KEYBOARD_PALETTE;
  const detail = budget.detail;

  const caseGeometry = useMemo(() => buildCaseGeometry(palette, detail), [palette, detail]);
  const glowGeometry = useMemo(() => buildGlowGeometry(palette, detail), [palette, detail]);
  const boardGeometry = useMemo(() => buildBoardGeometry(palette), [palette]);
  const traceGeometry = useMemo(() => buildTraceGeometry(), []);
  const plateGeometry = useMemo(() => buildPlateGeometry(), []);

  useEffect(() => () => caseGeometry.dispose(), [caseGeometry]);
  useEffect(() => () => glowGeometry.dispose(), [glowGeometry]);
  useEffect(() => () => boardGeometry.dispose(), [boardGeometry]);
  useEffect(() => () => traceGeometry.dispose(), [traceGeometry]);
  useEffect(() => () => plateGeometry.dispose(), [plateGeometry]);

  const frame = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const roll = useRef<Group>(null);
  const pan = useRef<Group>(null);
  const caseLayer = useRef<Group>(null);
  const boardLayer = useRef<Group>(null);
  const plateLayer = useRef<Group>(null);
  const switchLayer = useRef<Group>(null);
  const keyLayer = useRef<Group>(null);
  const smoothed = useRef({ x: 0, y: 0 });
  const opacity = useRef(-1);
  const drawn = useRef(false);

  useFrame((state, delta) => {
    const pose = controller.pose;
    const input = controller.readInput();
    const step = Math.min(delta, 0.06);

    // Input is eased here rather than tweened, so the scroll timeline and the
    // pointer offset never write the same value from two different owners.
    const easing = 1 - Math.exp(-step * 3.4);
    smoothed.current.x += (input.x - smoothed.current.x) * easing;
    smoothed.current.y += (input.y - smoothed.current.y) * easing;

    const camera = state.camera as PerspectiveCamera;
    const rotated = state.size.width < 768;
    const view = {
      aspect: state.size.width / Math.max(state.size.height, 1),
      fov: camera.fov,
      distance: camera.position.z,
      tilt: MathUtils.clamp(pose.tilt + smoothed.current.y * 0.1, 0.1, 0.8),
      rotated,
      // Wide screens leave a margin of desk around the keyboard; a tall screen
      // is filled by the rotated keyboard itself.
      fill: rotated ? 1 : DESKTOP_FILL,
    };
    const scale = frameScale(view) * pose.zoom;
    const limits = panLimits(view, pose.zoom);
    const panX = MathUtils.clamp(pose.panX + smoothed.current.x * 0.35, -1, 1);

    frame.current?.scale.setScalar(scale);
    if (tilt.current) tilt.current.rotation.x = -view.tilt;
    if (roll.current)
      roll.current.rotation.z = (rotated ? Math.PI / 2 : 0) + pose.roll;
    if (pan.current)
      // Axes here are the screen's, not the keyboard's: x runs along the long
      // axis, y along the rows and z toward the camera. The z shift centres the
      // exploded stack on the focal plane instead of the case, so the layers
      // spread both ways rather than all toward the camera.
      pan.current.position.set(
        -panX * limits.long,
        pose.panY * limits.short,
        -(layerLift(pose.morph, LAYER_GAP.length - 1) / 2),
      );
    [caseLayer, boardLayer, plateLayer, switchLayer, keyLayer].forEach(
      (ref, index) => {
        if (ref.current) ref.current.position.y = layerLift(pose.morph, index);
      },
    );

    const next = presenceOpacity(pose.presence);
    if (Math.abs(next - opacity.current) > 0.004) {
      opacity.current = next;
      state.gl.domElement.style.opacity = String(next);
    }

    if (!drawn.current) {
      drawn.current = true;
      onFirstFrame?.();
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[-5, 7, 6]} intensity={2.3} color="#ffffff" />
      <directionalLight position={[6, 2, -2]} intensity={1.5} color={palette.accent} />
      {/* Studio reflections rendered once from local geometry: no HDR download. */}
      {budget.reflections && (
        <Environment frames={1} resolution={128}>
          <Lightformer
            intensity={1.4}
            position={[0, 5, 4]}
            scale={[12, 5, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1}
            position={[-7, 1, 2]}
            scale={[5, 6, 1]}
            color={palette.accent}
          />
        </Environment>
      )}
      <group ref={frame}>
        <group ref={tilt}>
          <group ref={roll}>
            <group ref={pan}>
              {/* Lays the keyboard flat to face the camera, back row toward the top. */}
              <group rotation={[Math.PI / 2, 0, 0]}>
                <group ref={caseLayer}>
                  {/* The desk mat: far larger than any viewport, so no edge ever shows. */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
                    <planeGeometry args={[600, 600]} />
                    <meshStandardMaterial color={palette.desk} roughness={0.95} metalness={0} />
                  </mesh>
                  <mesh geometry={caseGeometry}>
                    <meshStandardMaterial
                      vertexColors
                      roughness={0.5}
                      metalness={budget.reflections ? 0.55 : 0.25}
                      envMapIntensity={0.8}
                    />
                  </mesh>
                  <mesh geometry={glowGeometry}>
                    <meshBasicMaterial vertexColors toneMapped={false} />
                  </mesh>
                </group>
                <group ref={boardLayer}>
                  <mesh geometry={boardGeometry}>
                    <meshStandardMaterial vertexColors roughness={0.7} metalness={0.05} />
                  </mesh>
                  <PcbTraces geometry={traceGeometry} palette={palette} />
                </group>
                <group ref={plateLayer}>
                  <mesh geometry={plateGeometry}>
                    <meshStandardMaterial
                      color={palette.plate}
                      roughness={0.38}
                      metalness={budget.reflections ? 0.85 : 0.4}
                      envMapIntensity={1}
                    />
                  </mesh>
                </group>
                <group ref={switchLayer}>
                  <Switches palette={palette} />
                  <Underglow palette={palette} pressed={pressed} />
                </group>
                <group ref={keyLayer}>
                  <Keycaps detail={detail} palette={palette} pressed={pressed} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
