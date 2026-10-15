"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Fog, Vector3 } from "three";
import { CAMERA, ORBIT } from "@/lib/config/scene";
import type { OrbitState } from "./lib/orbitGesture";

const DEG = Math.PI / 180;

/**
 * Development only: set `window.__sakinahView = { position, target }` in the
 * console to pin the camera for close-up review. Stripped from production.
 */
interface DevView {
  position: [number, number, number];
  target: [number, number, number];
}
/** Sway fades out quickly when a drag starts, and back in slowly after idle. */
const SWAY_FADE_OUT_SEC = 0.3;

/**
 * Narrow frames (the scene's half of a desktop page, a phone) see less
 * sideways: the camera pulls back until `CAMERA.minWidth` metres stay in view.
 */
function distanceForAspect(aspect: number) {
  const halfTan = Math.tan((CAMERA.fov / 2) * DEG);
  return Math.max(CAMERA.distance, CAMERA.minWidth / (2 * aspect * halfTan));
}

/**
 * Upper-floor view of the Kaaba. Eases towards the angle the user drags to;
 * when left alone for a few seconds, a very slow sway fades back in.
 * Same in both languages: the scene is a place, not a reading direction.
 */
export function CameraRig({
  orbit,
  still,
}: {
  orbit: OrbitState;
  still: boolean;
}) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const target = useMemo(() => new Vector3(), []);
  const view = useRef({
    azimuth: orbit.azimuthDeg,
    elevation: orbit.elevationDeg,
    swayWeight: still ? 0 : 1,
    /** Sway phase only advances while swaying, so it resumes where it paused. */
    swayTime: 0,
  });

  useFrame(({ camera, scene, invalidate }, delta) => {
    if (process.env.NODE_ENV !== "production") {
      const dev = (globalThis as { __sakinahView?: DevView }).__sakinahView;
      if (dev) {
        camera.position.set(...dev.position);
        camera.lookAt(...dev.target);
        return;
      }
    }

    const v = view.current;
    const dt = Math.min(delta, 0.1);

    const ease = 1 - Math.exp(-ORBIT.damping * dt);
    v.azimuth += (orbit.azimuthDeg - v.azimuth) * ease;
    v.elevation += (orbit.elevationDeg - v.elevation) * ease;

    const idle =
      !orbit.dragging &&
      performance.now() - orbit.lastInteraction > ORBIT.idleResumeMs;
    if (still || !idle) {
      v.swayWeight = Math.max(0, v.swayWeight - dt / SWAY_FADE_OUT_SEC);
    } else {
      v.swayWeight = Math.min(1, v.swayWeight + dt / ORBIT.swayBlendSec);
    }
    v.swayTime += dt * v.swayWeight;
    const sway =
      CAMERA.swayDeg *
      Math.sin((2 * Math.PI * v.swayTime) / CAMERA.swayPeriodSec) *
      v.swayWeight;

    const azimuth = (v.azimuth + sway) * DEG;
    const elevation = v.elevation * DEG;
    const d = distanceForAspect(aspect);
    target.set(...CAMERA.target);

    camera.position.set(
      target.x + d * Math.cos(elevation) * Math.sin(azimuth),
      target.y + d * Math.sin(elevation),
      target.z + d * Math.cos(elevation) * Math.cos(azimuth),
    );
    camera.lookAt(target);

    // Fog starts just behind the Kaaba whatever the distance, so it only
    // dissolves the far mataf and colonnades into the night.
    if (scene.fog instanceof Fog) {
      scene.fog.near = d - 8;
      scene.fog.far = d + 72;
    }

    // On-demand rendering (reduced motion): keep drawing until the ease settles.
    const settling =
      Math.abs(orbit.azimuthDeg - v.azimuth) > 0.01 ||
      Math.abs(orbit.elevationDeg - v.elevation) > 0.01;
    if (settling) invalidate();
  });

  return null;
}
