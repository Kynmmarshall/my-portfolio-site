"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import { Group, MathUtils } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";

gsap.registerPlugin(ScrollTrigger, useGSAP);
function Assembly({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const progress = useRef({ value: 0 });
  const { mode } = useVisualPreferences();
  const { viewport, size, gl, invalidate } = useThree();
  const mobile = size.width < 640;
  const wireframe = mode === "wireframe";
  useGSAP(
    () => {
      if (!animate || mobile) return;
      const hero = gl.domElement.closest(".hero");
      if (!hero) return;
      gsap.to(progress.current, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        onUpdate: invalidate,
      });
    },
    { dependencies: [animate, mobile, gl], revertOnUpdate: true },
  );
  useFrame((state, delta) => {
    if (!group.current) return;
    if (animate) elapsed.current += Math.min(delta, 0.05);
    const target =
      -0.55 +
      (animate
        ? Math.sin(elapsed.current * 0.22) * 0.15 + state.pointer.x * 0.07
        : 0) +
      progress.current.value * 0.5;
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      target,
      3,
      Math.min(delta, 0.1),
    );
    group.current.position.y =
      -0.05 + (animate ? Math.sin(elapsed.current * 0.65) * 0.09 : 0);
  });
  return (
    <group
      position={[mobile ? 0.1 : viewport.width * 0.245, 0, 0]}
      scale={mobile ? 0.84 : 1.12}
    >
      <group ref={group} rotation={[0.2, -0.55, 0.08]}>
        {Array.from({ length: 7 }, (_, index) => (
          <RoundedBox
            key={index}
            args={[2.7, 0.15, 2.15]}
            radius={0.1}
            smoothness={3}
            position={[0, -0.95 + index * 0.29, 0]}
            rotation={[0, index * 0.022, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={
                wireframe
                  ? "#407b66"
                  : index === 6
                    ? "#c9d9bb"
                    : index === 3
                      ? "#a6bb91"
                      : "#377767"
              }
              roughness={0.32}
              metalness={0.36}
              wireframe={wireframe}
            />
          </RoundedBox>
        ))}
        {[-1, 1].flatMap((horizontal) =>
          [-0.72, 0.72].map((depth) => (
            <mesh
              key={`${horizontal}-${depth}`}
              position={[horizontal, -0.1, depth]}
            >
              <cylinderGeometry args={[0.045, 0.045, 2.45, 12]} />
              <meshStandardMaterial
                color="#b9c4aa"
                metalness={0.8}
                roughness={0.23}
                wireframe={wireframe}
              />
            </mesh>
          )),
        )}
        <RoundedBox
          args={[0.85, 0.58, 0.85]}
          position={[-0.63, 1.33, -0.33]}
          radius={0.08}
          smoothness={4}
        >
          <meshStandardMaterial
            color="#d3e4a5"
            metalness={0.2}
            roughness={0.35}
            wireframe={wireframe}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.48, 0.44, 0.48]}
          position={[0.46, 1.23, 0.5]}
          radius={0.08}
          smoothness={4}
        >
          <meshStandardMaterial
            color="#ce7e65"
            metalness={0.3}
            roughness={0.3}
            wireframe={wireframe}
          />
        </RoundedBox>
        <mesh position={[0.57, 1.16, -0.56]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.095, 12, 36]} />
          <meshStandardMaterial
            color="#758b76"
            metalness={0.7}
            roughness={0.16}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[0, -0.17, 0]} rotation={[Math.PI / 2, 0, 0.3]}>
          <torusGeometry args={[2.1, 0.006, 6, 100]} />
          <meshBasicMaterial color="#9cae8e" />
        </mesh>
        <mesh position={[0, -0.17, 0]} rotation={[0.4, 0.5, 0.5]}>
          <torusGeometry args={[2.35, 0.006, 6, 100]} />
          <meshBasicMaterial color="#b1bea2" />
        </mesh>
      </group>
      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.28}
        scale={10}
        blur={2.8}
        far={5}
        resolution={256}
        frames={1}
        color="#385838"
      />
    </group>
  );
}
export default function ArchitecturalScene({ visible }: { visible: boolean }) {
  const { paused, reducedMotion } = useVisualPreferences();
  const [lost, setLost] = useState(false);
  const pageVisible = usePageVisibility();
  const animate = !paused && !reducedMotion && visible && pageVisible;
  if (lost) return null;
  return (
    <Canvas
      camera={{ position: [0, 2.7, 10.5], fov: 37 }}
      dpr={[1, 1.5]}
      frameloop={animate ? "always" : "demand"}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f2f4ed");
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
      <ambientLight intensity={1.4} />
      <directionalLight position={[-3, 7, 5]} intensity={3} color="#fffaec" />
      <directionalLight position={[6, 2, -3]} intensity={2} color="#d5eddf" />
      <Environment resolution={128}>
        <Lightformer intensity={3} position={[-3, 4, 2]} scale={[6, 6, 1]} />
        <Lightformer
          intensity={2}
          position={[4, 2, -2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[4, 4, 1]}
        />
      </Environment>
      <Assembly animate={animate} />
    </Canvas>
  );
}
