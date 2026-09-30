"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Fog, Vector3 } from "three";
import { CAMERA } from "@/lib/config/scene";

const DEG = Math.PI / 180;

/**
 * Portrait screens see less sideways and stack the text above the scene, so
 * the camera pulls back and aims higher, sitting the Kaaba lower in frame.
 */
function framingForAspect(aspect: number) {
  const portrait = Math.max(0, 1 - aspect);
  return { distance: CAMERA.distance * (1 + portrait * 1.1), lift: portrait * 14 };
}

/**
 * Upper-floor view of the Kaaba with a very slow side-to-side drift.
 * Same in both languages: the scene is a place, not a reading direction.
 */
export function CameraRig({ still }: { still: boolean }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const target = useMemo(() => new Vector3(), []);

  useFrame(({ camera, clock, scene }) => {
    const t = still ? 0 : clock.getElapsedTime();
    const sway = CAMERA.swayDeg * Math.sin((2 * Math.PI * t) / CAMERA.swayPeriodSec);
    const azimuth = (CAMERA.azimuthDeg + sway) * DEG;
    const elevation = CAMERA.elevationDeg * DEG;
    const { distance: d, lift } = framingForAspect(aspect);
    target.set(CAMERA.target[0], CAMERA.target[1] + lift, CAMERA.target[2]);

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
  });

  return null;
}
