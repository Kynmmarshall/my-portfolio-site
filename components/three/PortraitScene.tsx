"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, Vector2, type Texture } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { SceneFrameBridge } from "@/components/three/SceneFrameBridge";
import {
  acquirePortraitTexture,
  releasePortraitTexture,
} from "@/lib/visuals/scene-assets";

gsap.registerPlugin(ScrollTrigger);

function Portrait({
  texture,
  onReady,
}: {
  texture: Texture;
  onReady: (ready: boolean) => void;
}) {
  const portrait = useRef<Group>(null);
  const pointer = useRef(new Vector2());
  const progress = useRef(0);
  const clock = useRef(0);
  const drawn = useRef(false);
  const controller = useSceneMotion();
  const { viewport, size, gl } = useThree();
  const mobile = size.width < 640;
  const photoSize = mobile
    ? Math.min(viewport.width * 0.82, viewport.height * 0.74)
    : Math.min(viewport.height * 0.8, viewport.width * 0.38, 5.4);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      const bounds = gl.domElement.getBoundingClientRect();
      pointer.current.set(
        MathUtils.clamp(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -1,
          1,
        ),
        MathUtils.clamp(
          ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
          -1,
          1,
        ),
      );
    };
    const reset = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", reset);
    };
  }, [gl]);

  // Read scroll progress directly with no scrub easing: Lenis already smooths the
  // scroll position, so a second easing layer would lag behind the hero content.
  useEffect(() => {
    const hero = gl.domElement.closest(".hero");
    if (!hero) return;
    const trigger = ScrollTrigger.create({
      trigger: hero as HTMLElement,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => trigger.kill();
  }, [gl]);

  useFrame((_state, delta) => {
    const group = portrait.current;
    if (!group) return;
    const step = Math.min(delta, 0.05);
    if (controller.isAmbient()) {
      clock.current += step;
      group.rotation.y = MathUtils.damp(
        group.rotation.y,
        pointer.current.x * 0.1,
        3,
        step,
      );
      group.rotation.x = MathUtils.damp(
        group.rotation.x,
        pointer.current.y * 0.055,
        3,
        step,
      );
      group.position.x = MathUtils.damp(
        group.position.x,
        pointer.current.x * 0.09,
        3,
        step,
      );
    }
    group.position.y =
      Math.sin(clock.current * 0.65) * 0.025 + progress.current * 0.24;
    if (!drawn.current) {
      drawn.current = true;
      onReady(true);
    }
  });

  return (
    <group
      position={[mobile ? 0 : viewport.width * 0.255, mobile ? 0.23 : 0.18, 0]}
    >
      <group ref={portrait}>
        <mesh position={[-0.045, -0.025, -0.3]} scale={1.015}>
          <planeGeometry args={[photoSize, photoSize]} />
          <meshBasicMaterial
            map={texture}
            color="#477664"
            transparent
            opacity={0.07}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.035, -0.015, -0.15]}>
          <planeGeometry args={[photoSize, photoSize]} />
          <meshBasicMaterial
            map={texture}
            color="#d0a37b"
            transparent
            opacity={0.06}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <planeGeometry args={[photoSize, photoSize]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.01}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function PortraitScene({
  visible,
  onReady,
}: {
  visible: boolean;
  onReady: (ready: boolean) => void;
}) {
  const [lost, setLost] = useState(false);
  const [texture, setTexture] = useState<Texture | null>(null);

  // Owned here rather than left in the `useTexture` cache, so disposal is
  // deterministic and a response arriving after unmount cannot leak.
  useEffect(() => {
    let active = true;
    acquirePortraitTexture().then((loaded) => {
      if (active) setTexture(loaded);
    });
    return () => {
      active = false;
      setTexture(null);
      releasePortraitTexture();
    };
  }, []);

  if (lost || !texture) return null;
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 12], zoom: 100 }}
      dpr={[1, 1.5]}
      frameloop="never"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f2f4ed", 0);
        const canvas = gl.domElement;
        const onLost = (event: Event) => {
          event.preventDefault();
          canvas.removeEventListener("webglcontextlost", onLost);
          // Hand the hero back to the real portrait image.
          onReady(false);
          setLost(true);
        };
        canvas.addEventListener("webglcontextlost", onLost);
      }}
    >
      {/* Unsubscribing while the hero is scrolled away stops this root entirely. */}
      {visible && <SceneFrameBridge />}
      <Portrait texture={texture} onReady={onReady} />
    </Canvas>
  );
}
