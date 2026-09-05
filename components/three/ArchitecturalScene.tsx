"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
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
  useGSAP(() => {
    if (!animate || mobile) return;
    const hero = gl.domElement.closest(".hero");
    if (!hero) return;
    gsap.to(progress.current, { value: 1, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 }, onUpdate: invalidate });
  }, { dependencies: [animate, mobile, gl], revertOnUpdate: true });
  useFrame((state, delta) => {
    if (!group.current) return;
    if (animate) elapsed.current += Math.min(delta, .05);
    const target = -.55 + (animate ? Math.sin(elapsed.current * .22) * .15 + state.pointer.x * .07 : 0) + progress.current.value * .5;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, target, 3, Math.min(delta, .1));
    group.current.position.y = -.05 + (animate ? Math.sin(elapsed.current * .65) * .09 : 0);
  });
  return <group position={[mobile ? .1 : viewport.width * .245, 0, 0]} scale={mobile ? .84 : 1.12}><group ref={group} rotation={[.2, -.55, .08]}>
    {Array.from({ length: 7 }, (_, index) => <RoundedBox key={index} args={[2.7, .15, 2.15]} radius={.1} smoothness={3} position={[0, -.95 + index * .29, 0]} rotation={[0, index * .022, 0]} castShadow receiveShadow><meshStandardMaterial color={wireframe ? "#407b66" : index === 6 ? "#c9d9bb" : index === 3 ? "#a6bb91" : "#377767"} roughness={.32} metalness={.36} wireframe={wireframe} /></RoundedBox>)}
    {[-1, 1].flatMap((horizontal) => [-.72, .72].map((depth) => <mesh key={`${horizontal}-${depth}`} position={[horizontal, -.1, depth]}><cylinderGeometry args={[.045, .045, 2.45, 12]} /><meshStandardMaterial color="#b9c4aa" metalness={.8} roughness={.23} wireframe={wireframe} /></mesh>))}
    <RoundedBox args={[.85, .58, .85]} position={[-.63, 1.33, -.33]} radius={.08} smoothness={4}><meshStandardMaterial color="#d3e4a5" metalness={.2} roughness={.35} wireframe={wireframe} /></RoundedBox>
    <RoundedBox args={[.48, .44, .48]} position={[.46, 1.23, .5]} radius={.08} smoothness={4}><meshStandardMaterial color="#ce7e65" metalness={.3} roughness={.3} wireframe={wireframe} /></RoundedBox>
    <mesh position={[.57, 1.16, -.56]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.26, .095, 12, 36]} /><meshStandardMaterial color="#758b76" metalness={.7} roughness={.16} wireframe={wireframe} /></mesh>
    <mesh position={[0, -.17, 0]} rotation={[Math.PI / 2, 0, .3]}><torusGeometry args={[2.1, .006, 6, 100]} /><meshBasicMaterial color="#9cae8e" /></mesh>
    <mesh position={[0, -.17, 0]} rotation={[.4, .5, .5]}><torusGeometry args={[2.35, .006, 6, 100]} /><meshBasicMaterial color="#b1bea2" /></mesh>
  </group><ContactShadows position={[0, -1.9, 0]} opacity={.28} scale={10} blur={2.8} far={5} resolution={256} frames={1} color="#385838" /></group>;
}
export default function ArchitecturalScene({ visible }: { visible: boolean }) {
  const { paused, reducedMotion, mode } = useVisualPreferences();
  const pageVisible = usePageVisibility();
  const animate = !paused && !reducedMotion && visible && pageVisible;
  return <Canvas key={mode} camera={{ position: [0, 2.7, 10.5], fov: 37 }} dpr={[1, 1.5]} frameloop={animate ? "always" : "demand"} gl={{ antialias: true, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: true }} onCreated={({ gl }) => gl.setClearColor("#f2f4ed")}>
    <ambientLight intensity={1.4} /><directionalLight position={[-3, 7, 5]} intensity={3} color="#fffaec" /><directionalLight position={[6, 2, -3]} intensity={2} color="#d5eddf" />
    <Environment resolution={128}><Lightformer intensity={3} position={[-3, 4, 2]} scale={[6, 6, 1]} /><Lightformer intensity={2} position={[4, 2, -2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 4, 1]} /></Environment><Assembly animate={animate} />
  </Canvas>;
}