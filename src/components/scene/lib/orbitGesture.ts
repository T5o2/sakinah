import { CAMERA, ORBIT } from "@/lib/config/scene";

/**
 * Drag-to-orbit and tap detection for the hero scene, as plain logic with no
 * DOM or three.js, so it can be unit-tested.
 *
 * - A press that barely moves and ends quickly is a tap: up() returns true
 *   and the caller opens the transition.
 * - Anything else is a drag: horizontal turns the view round the Kaaba; vertical
 *   (mouse and pen only) tilts it within limits. On touch the page owns vertical
 *   pans (touch-action: pan-y), so a vertical swipe scrolls and never reaches us.
 * - Drag direction is spatial, identical in both languages.
 */

export type PointerKind = "mouse" | "touch" | "pen";

export interface PointerSample {
  id: number;
  kind: PointerKind;
  x: number;
  y: number;
  /** ms, e.g. event.timeStamp. */
  t: number;
}

export interface OrbitState {
  /** Where the user has dragged the view (degrees). CameraRig eases towards these. */
  azimuthDeg: number;
  elevationDeg: number;
  dragging: boolean;
  /** Time (ms) of the last drag movement; the idle sway waits after it. */
  lastInteraction: number;
}

export interface OrbitGesture {
  readonly state: OrbitState;
  down(p: PointerSample): void;
  move(p: PointerSample): void;
  /** Ends the press; true when it was a tap rather than a drag. */
  up(p: PointerSample): boolean;
  cancel(): void;
}

export function clampElevation(deg: number): number {
  return Math.min(ORBIT.elevationMaxDeg, Math.max(ORBIT.elevationMinDeg, deg));
}

export function createOrbitGesture(): OrbitGesture {
  const state: OrbitState = {
    azimuthDeg: CAMERA.azimuthDeg,
    elevationDeg: CAMERA.elevationDeg,
    dragging: false,
    lastInteraction: Number.NEGATIVE_INFINITY,
  };
  let press: { start: PointerSample; last: PointerSample } | null = null;

  return {
    state,

    down(p) {
      if (press) return; // one pointer drives the camera at a time
      press = { start: p, last: p };
      state.dragging = false;
    },

    move(p) {
      if (!press || p.id !== press.start.id) return;
      const moved = Math.hypot(p.x - press.start.x, p.y - press.start.y);
      if (!state.dragging && moved > ORBIT.tapMaxMovePx) state.dragging = true;

      if (state.dragging) {
        const dx = p.x - press.last.x;
        const dy = p.y - press.last.y;
        // Grab-the-world feel: dragging right turns the scene right (camera moves left).
        state.azimuthDeg -= dx * ORBIT.degPerPx;
        if (p.kind !== "touch") {
          // Dragging down lifts the camera for a higher view.
          state.elevationDeg = clampElevation(
            state.elevationDeg + dy * ORBIT.degPerPx,
          );
        }
        state.lastInteraction = p.t;
      }
      press.last = p;
    },

    up(p) {
      if (!press || p.id !== press.start.id) return false;
      const wasTap = !state.dragging && p.t - press.start.t <= ORBIT.tapMaxMs;
      if (state.dragging) state.lastInteraction = p.t;
      press = null;
      state.dragging = false;
      return wasTap;
    },

    /** The browser took the gesture (e.g. a vertical scroll): no tap, no drag. */
    cancel() {
      press = null;
      state.dragging = false;
    },
  };
}
