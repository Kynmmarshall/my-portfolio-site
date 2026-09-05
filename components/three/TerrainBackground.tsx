"use client";

import { useEffect, useRef } from "react";
import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";

const vertexShader = `
  uniform float phase;
  uniform float scrollOffset;
  varying vec2 gridPosition;
  varying float viewDepth;
  varying float elevation;
  void main() {
    vec3 transformed = position;
    float radius = length(position.xy * vec2(0.7, 1.0));
    float wave = sin(position.x * 0.35 + phase * 2.0) * cos(position.y * 0.24 - phase);
    float ripple = sin(radius * 0.60 - phase * 3.0 + scrollOffset) * 0.38;
    transformed.z = wave * 0.85 + ripple;
    elevation = transformed.z;
    gridPosition = position.xy;
    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    viewDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  varying vec2 gridPosition;
  varying float viewDepth;
  varying float elevation;
  void main() {
    vec2 coordinate = gridPosition * 1.35;
    vec2 distanceToLine = abs(fract(coordinate - 0.5) - 0.5);
    vec2 pixelWidth = max(fwidth(coordinate), vec2(0.0001));
    float defocus = smoothstep(5.0, 22.0, abs(viewDepth - 11.0));
    vec2 sharpLine = 1.0 - smoothstep(pixelWidth * 0.40, pixelWidth * (1.20 + defocus * 1.6), distanceToLine);
    vec2 haloLine = exp(-pow(distanceToLine / (pixelWidth * (2.4 + defocus * 3.0)), vec2(2.0)));
    float grid = max(sharpLine.x, sharpLine.y) * (1.0 - defocus * 0.45);
    float halo = max(haloLine.x, haloLine.y) * 0.17;
    float edge = 1.0 - smoothstep(12.0, 20.0, length(gridPosition * vec2(0.75, 1.0)));
    float depthFade = 1.0 - smoothstep(14.0, 34.0, viewDepth);
    vec3 color = mix(vec3(0.10, 0.40, 0.35), vec3(0.20, 0.65, 0.48), smoothstep(-1.3, 1.3, elevation));
    float alpha = (grid + halo) * edge * depthFade * 0.27;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function TerrainBackground() {
  const container = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const startLoop = useRef<(() => void) | null>(null);
  const { paused, reducedMotion } = useVisualPreferences();
  const pageVisible = usePageVisibility();

  useEffect(() => {
    running.current = !paused && !reducedMotion && pageVisible;
    startLoop.current?.();
  }, [paused, reducedMotion, pageVisible]);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    const scene = new Scene();
    const camera = new PerspectiveCamera(43, 1, 0.1, 65);
    const geometry = new PlaneGeometry(42, 32, 84, 64);
    geometry.boundingSphere = new Sphere(new Vector3(), 28);
    const uniforms = { phase: { value: 0 }, scrollOffset: { value: 0 } };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    const terrain = new Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, -2.3, -6);
    terrain.frustumCulled = true;
    scene.add(terrain);
    const pointer = new Vector2();
    const smoothed = new Vector2();
    let targetScroll = 0;
    let frame = 0;
    let lastRender = 0;
    let elapsed = 0;
    let alive = true;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let frameDuration = 1000 / 30;

    const render = (timestamp: number) => {
      frame = 0;
      if (!alive || !running.current) return;
      const difference = timestamp - lastRender;
      if (difference >= frameDuration) {
        const delta = Math.min(difference / 1000, 0.07);
        elapsed = (elapsed + delta) % 120;
        uniforms.phase.value = (elapsed / 120) * Math.PI * 2;
        uniforms.scrollOffset.value +=
          (targetScroll - uniforms.scrollOffset.value) * 0.06;
        smoothed.lerp(pointer, 1 - Math.exp(-delta * 3));
        camera.position.set(smoothed.x * 0.65, 5.6 + smoothed.y * 0.35, 12.5);
        camera.lookAt(smoothed.x * 0.25, -1.4, -5.5);
        renderer.render(scene, camera);
        lastRender = timestamp;
      }
      frame = requestAnimationFrame(render);
    };
    const wake = () => {
      if (running.current && !frame && alive) {
        lastRender = performance.now();
        frame = requestAnimationFrame(render);
      } else if (!running.current && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const resize = () => {
      if (!alive) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      const mobile = width < 768;
      frameDuration = 1000 / (mobile ? 24 : 30);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      camera.position.set(smoothed.x * 0.65, 5.6 + smoothed.y * 0.35, 12.5);
      camera.lookAt(smoothed.x * 0.25, -1.4, -5.5);
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });
    const move = (event: PointerEvent) => {
      if (!running.current || event.pointerType !== "mouse") return;
      pointer.set(
        (event.clientX / innerWidth) * 2 - 1,
        (event.clientY / innerHeight) * 2 - 1,
      );
    };
    const scroll = () => {
      if (running.current) targetScroll = Math.min(scrollY * 0.00035, 8);
    };
    const tilt = (event: Event) => {
      if (!running.current) return;
      const value = (event as CustomEvent<{ x: number; y: number }>).detail;
      if (Number.isFinite(value?.x) && Number.isFinite(value?.y))
        pointer.set(
          Math.max(-1, Math.min(1, value.x)),
          Math.max(-1, Math.min(1, value.y)),
        );
    };
    const lost = (event: Event) => {
      event.preventDefault();
      alive = false;
      cancelAnimationFrame(frame);
      host.dataset.ready = "false";
      canvas.style.visibility = "hidden";
    };
    canvas.addEventListener("webglcontextlost", lost);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("portfolio:tilt", tilt);
    observer.observe(host);
    resize();
    host.dataset.ready = "true";
    startLoop.current = wake;
    wake();

    return () => {
      alive = false;
      startLoop.current = null;
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("portfolio:tilt", tilt);
      canvas.removeEventListener("webglcontextlost", lost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div ref={container} className="terrain-background" aria-hidden="true" />
  );
}
