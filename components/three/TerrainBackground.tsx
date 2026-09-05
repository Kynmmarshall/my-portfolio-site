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
import {
  FRAME_INTERVAL,
  TerrainQualityMonitor,
  initialTerrainQuality,
  nextFrameDeadline,
  terrainBudget,
} from "@/lib/visuals/terrain-performance";

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
    float grid = max(sharpLine.x, sharpLine.y) * (1.0 - defocus * 0.45);
    float halo = 0.0;
    #ifndef LOW_POWER
      vec2 haloLine = 1.0 - smoothstep(pixelWidth, pixelWidth * (3.0 + defocus), distanceToLine);
      halo = max(haloLine.x, haloLine.y) * 0.12;
    #endif
    float edge = 1.0 - smoothstep(12.0, 20.0, length(gridPosition * vec2(0.75, 1.0)));
    float depthFade = 1.0 - smoothstep(14.0, 34.0, viewDepth);
    vec3 color = mix(vec3(0.10, 0.40, 0.35), vec3(0.20, 0.65, 0.48), smoothstep(-1.3, 1.3, elevation));
    float alpha = (grid + halo) * edge * depthFade * 0.27;
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
        preserveDrawingBuffer: false,
        depth: false,
        stencil: false,
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
    const capabilities = navigator as Navigator & { deviceMemory?: number };
    let quality = initialTerrainQuality({
      width: host.clientWidth,
      coarsePointer: matchMedia("(pointer: coarse)").matches,
      cores: navigator.hardwareConcurrency,
      memory: capabilities.deviceMemory,
    });
    const initialBudget = terrainBudget(
      host.clientWidth,
      host.clientHeight,
      devicePixelRatio,
      quality,
    );
    let geometry = new PlaneGeometry(
      42,
      32,
      initialBudget.widthSegments,
      initialBudget.heightSegments,
    );
    geometry.boundingSphere = new Sphere(new Vector3(), 28);
    const uniforms = { phase: { value: 0 }, scrollOffset: { value: 0 } };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      defines: quality > 0 ? { LOW_POWER: 1 } : {},
      transparent: true,
      depthWrite: false,
      depthTest: false,
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
    let lastTick = 0;
    let deadline = 0;
    let elapsed = 0;
    let alive = true;
    let intersecting = true;
    let width = host.clientWidth;
    let height = host.clientHeight;
    let scrollRange = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const monitor = new TerrainQualityMonitor();

    const applyQuality = () => {
      const budget = terrainBudget(width, height, devicePixelRatio, quality);
      geometry.dispose();
      geometry = new PlaneGeometry(
        42,
        32,
        budget.widthSegments,
        budget.heightSegments,
      );
      geometry.boundingSphere = new Sphere(new Vector3(), 28);
      terrain.geometry = geometry;
      material.defines = quality > 0 ? { LOW_POWER: 1 } : {};
      material.needsUpdate = true;
      host.dataset.quality = String(quality);
      host.dataset.vertices = String(
        (budget.widthSegments + 1) * (budget.heightSegments + 1),
      );
      host.dataset.targetFps = quality === 3 ? "0" : "60";
      resize();
    };

    const active = () =>
      alive &&
      running.current &&
      !document.hidden &&
      intersecting &&
      quality !== 3;

    const render = (timestamp: number) => {
      frame = 0;
      if (!active()) return;
      const nextQuality = monitor.observe(timestamp - lastTick, quality);
      lastTick = timestamp;
      if (nextQuality !== quality) {
        quality = nextQuality;
        applyQuality();
        if (quality === 3) return;
      }
      const difference = timestamp - lastRender;
      if (timestamp + 0.5 >= deadline) {
        const delta = Math.min(difference / 1000, 0.07);
        elapsed = (elapsed + delta) % 120;
        uniforms.phase.value = (elapsed / 120) * Math.PI * 2;
        const smoothing = 1 - Math.exp(-delta * 3);
        uniforms.scrollOffset.value +=
          (targetScroll - uniforms.scrollOffset.value) * smoothing;
        if (smoothed.distanceToSquared(pointer) > 0.000001) {
          smoothed.lerp(pointer, smoothing);
          camera.position.set(smoothed.x * 0.65, 5.6 + smoothed.y * 0.35, 12.5);
          camera.lookAt(smoothed.x * 0.25, -1.4, -5.5);
        }
        renderer.render(scene, camera);
        lastRender = timestamp;
        deadline = nextFrameDeadline(deadline, timestamp);
      }
      frame = requestAnimationFrame(render);
    };
    const wake = () => {
      if (active() && !frame) {
        lastRender = performance.now();
        lastTick = lastRender;
        deadline = lastRender + FRAME_INTERVAL;
        monitor.reset();
        frame = requestAnimationFrame(render);
      } else if (!active() && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const resize = () => {
      if (!alive) return;
      width = host.clientWidth;
      height = host.clientHeight;
      scrollRange = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
      if (!width || !height || document.hidden) return;
      if (width < 768 && quality === 0) {
        quality = 1;
        applyQuality();
        return;
      }
      const budget = terrainBudget(width, height, devicePixelRatio, quality);
      renderer.setPixelRatio(budget.ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      camera.position.set(smoothed.x * 0.65, 5.6 + smoothed.y * 0.35, 12.5);
      camera.lookAt(smoothed.x * 0.25, -1.4, -5.5);
      renderer.render(scene, camera);
      monitor.reset();
    };
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });
    const move = (event: PointerEvent) => {
      if (!active() || event.pointerType !== "mouse") return;
      pointer.set(
        (event.clientX / Math.max(width, 1)) * 2 - 1,
        (event.clientY / Math.max(height, 1)) * 2 - 1,
      );
    };
    const scroll = () => {
      if (active()) targetScroll = Math.min(scrollY / scrollRange, 1) * 2;
    };
    const tilt = (event: Event) => {
      if (!active()) return;
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
    const visibility = () => {
      if (!document.hidden) resize();
      wake();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      wake();
    });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("portfolio:tilt", tilt);
    observer.observe(host);
    intersection.observe(host);
    applyQuality();
    host.dataset.ready = "true";
    startLoop.current = wake;
    wake();

    return () => {
      alive = false;
      startLoop.current = null;
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
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
