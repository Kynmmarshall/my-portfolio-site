"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  Group,
  MathUtils,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform float time;
  uniform float scroll;
  uniform float schematic;
  uniform vec2 pointer;
  void main() {
    vec2 position = vUv + pointer * vec2(0.025, 0.018);
    float bend = sin(position.x * 4.0 + time * 0.18 + scroll * 1.4) * 0.12;
    bend += sin(position.x * 8.0 - position.y * 3.0 + scroll) * 0.035;
    float phase = (position.y + bend + scroll * 0.045) * 28.0;
    float distanceToLine = abs(fract(phase) - 0.5);
    float line = 1.0 - smoothstep(0.012, 0.048, distanceToLine);
    float fade = smoothstep(0.25, 0.68, vUv.x) * smoothstep(0.0, 0.2, vUv.y);
    fade *= 1.0 - smoothstep(0.72, 1.0, vUv.y);
    vec3 color = mix(vec3(0.28, 0.50, 0.41), vec3(0.65, 0.44, 0.33), vUv.y);
    gl_FragColor = vec4(color, line * fade * (0.22 + schematic * 0.18));
  }
`;

function Portrait({ animate }: { animate: boolean }) {
  const portrait = useRef<Group>(null);
  const backdrop = useRef<ShaderMaterial>(null);
  const pointer = useRef(new Vector2());
  const progress = useRef({ value: 0 });
  const clock = useRef(0);
  const texture = useTexture("/media/profile/portrait.webp", (loaded) => {
    for (const image of Array.isArray(loaded) ? loaded : [loaded])
      image.colorSpace = SRGBColorSpace;
  });
  const { viewport, size, gl, invalidate } = useThree();
  const { mode } = useVisualPreferences();
  const mobile = size.width < 640;
  const photoSize = mobile
    ? Math.min(viewport.width * 0.82, viewport.height * 0.74)
    : Math.min(viewport.height * 0.8, viewport.width * 0.38, 5.4);
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    scroll: { value: 0 },
    schematic: { value: 0 },
    pointer: { value: new Vector2() },
  }));

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
    if (!portrait.current || !backdrop.current) return;
    backdrop.current.uniforms.schematic.value = mode === "wireframe" ? 1 : 0;
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
    backdrop.current.uniforms.time.value = clock.current;
    backdrop.current.uniforms.scroll.value = progress.current.value;
    backdrop.current.uniforms.pointer.value.lerp(
      pointer.current,
      Math.min(step * 3, 1),
    );
  });

  return (
    <>
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <shaderMaterial
          ref={backdrop}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
        />
      </mesh>
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
