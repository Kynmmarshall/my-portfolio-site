"use client";

import { useCallback, useRef, useState } from "react";
import { Move3D, RotateCcw } from "lucide-react";
import { useSceneMotion } from "@/context/ScrollMotionProvider";

/**
 * Opt-in direct manipulation of the background sculpture.
 *
 * Pointer capture keeps the drag bound to this control, so the background canvas
 * stays `pointer-events: none` and page text, links and scrolling are untouched.
 */
export function SceneInteractionZone() {
  const controller = useSceneMotion();
  const [shaped, setShaped] = useState(false);
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0, inputX: 0, inputY: 0 });

  const apply = useCallback(
    (x: number, y: number) => {
      controller.setInput(x, y, true);
      // Deliberate user input, so it redraws even while ambient motion is paused.
      controller.requestFrame();
      setShaped(true);
    },
    [controller],
  );

  const reset = useCallback(() => {
    controller.resetInput();
    controller.requestFrame();
    setShaped(false);
  }, [controller]);

  const endDrag = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <div className="scene-interaction">
      <button
        type="button"
        className="icon-button scene-drag"
        aria-label="Shape the background sculpture. Drag, or use arrow keys to rotate."
        title="Shape the background sculpture"
        onPointerDown={(event) => {
          const input = controller.readInput();
          dragging.current = true;
          origin.current = {
            x: event.clientX,
            y: event.clientY,
            inputX: input.x,
            inputY: input.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          const reach = Math.max(window.innerWidth * 0.35, 1);
          apply(
            origin.current.inputX + (event.clientX - origin.current.x) / reach,
            origin.current.inputY + (event.clientY - origin.current.y) / reach,
          );
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          dragging.current = false;
        }}
        onKeyDown={(event) => {
          const step = 0.12;
          const input = controller.readInput();
          if (event.key === "ArrowLeft") apply(input.x - step, input.y);
          else if (event.key === "ArrowRight") apply(input.x + step, input.y);
          else if (event.key === "ArrowUp") apply(input.x, input.y - step);
          else if (event.key === "ArrowDown") apply(input.x, input.y + step);
          else if (event.key === "Home" || event.key === "Escape") reset();
          else return;
          event.preventDefault();
        }}
      >
        <Move3D size={13} />
      </button>
      {shaped && (
        <button
          type="button"
          className="icon-button"
          onClick={reset}
          aria-label="Reset the background sculpture"
          title="Reset the background sculpture"
        >
          <RotateCcw size={13} />
        </button>
      )}
    </div>
  );
}
