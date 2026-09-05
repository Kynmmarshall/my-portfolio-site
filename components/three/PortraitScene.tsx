"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Group, MathUtils, SRGBColorSpace, Vector2 } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Portrait({ animate }: { animate: boolean }) {
  const portrait = useRef<Group>(null);
  const pointer = useRef(new Vector2());
  const progress = useRef({ value: 0 });
  const clock = useRef(0);
  const texture = useTexture("/media/profile/portrait.webp", (loaded) => {
    for (const image of Array.isArray(loaded) ? loaded : [loaded])
      image.colorSpace = SRGBColorSpace;
  });
  const { viewport, size, gl, invalidate } = useThree();
  const mobile = size.width < 640;
  const photoSize = mobile
    ? Math.min(viewport.width * 0.82, viewport.height * 0.74)
    : Math.min(viewport.height * 0.8, viewport.width * 0.38, 5.4);

  useEffect(() => {
    if (!animate || !window.matchMedia("(pointer: fine)").matches) return;
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
  }, [animate, gl]);

  useGSAP(
    () => {
      if (!animate) return;
      const hero = gl.domElement.closest(".hero");
      if (!hero) return;
      gsap.to(progress.current, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
        onUpdate: invalidate,
      });
    },
    { dependencies: [animate, gl], revertOnUpdate: true },
  );

  useFrame((_state, delta) => {
    if (!portrait.current) return;
    if (!animate) return;
    const step = Math.min(delta, 0.05);
    clock.current += step;
    portrait.current.rotation.y = MathUtils.damp(
      portrait.current.rotation.y,
      pointer.current.x * 0.1,
      3,
      step,
    );
    portrait.current.rotation.x = MathUtils.damp(
      portrait.current.rotation.x,
      pointer.current.y * 0.055,
      3,
      step,
    );
    portrait.current.position.x = MathUtils.damp(
      portrait.current.position.x,
      pointer.current.x * 0.09,
      3,
      step,
    );
    portrait.current.position.y =
      Math.sin(clock.current * 0.65) * 0.025 + progress.current.value * 0.24;
  });

  return (
    <>
      <group
        position={[
          mobile ? 0 : viewport.width * 0.255,
          mobile ? 0.23 : 0.18,
          0,
        ]}
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
    </>
  );
}

export default function PortraitScene({ visible }: { visible: boolean }) {
  const { paused, reducedMotion } = useVisualPreferences();
  const pageVisible = usePageVisibility();
  const [lost, setLost] = useState(false);
  const animate = !paused && !reducedMotion && visible && pageVisible;
  if (lost) return null;
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 12], zoom: 100 }}
      dpr={[1, 1.5]}
      frameloop={animate ? "always" : "demand"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f2f4ed", 0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            setLost(true);
          },
          { once: true },
        );
      }}
    >
      <Suspense fallback={null}>
        <Portrait animate={animate} />
      </Suspense>
    </Canvas>
  );
}
