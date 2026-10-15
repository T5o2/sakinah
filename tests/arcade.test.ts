import { describe, expect, it } from "vitest";
import { CAMERA, ORBIT } from "../src/lib/config/scene";
import { ARCADE, columnAngle, columnBehindMataf } from "../src/components/scene/lib/arcade";
import { MATAF } from "../src/components/scene/lib/layout";

const DEG = Math.PI / 180;

/** Camera on the floor plane, as the camera rig places it (desktop distance, or a phone's farther one). */
function cameraAt(azimuthDeg: number, elevationDeg: number, distance = CAMERA.distance) {
  const flat = distance * Math.cos(elevationDeg * DEG);
  return { x: flat * Math.sin(azimuthDeg * DEG), z: flat * Math.cos(azimuthDeg * DEG) };
}

/** Angle between column c and the camera's bearing, seen from the centre. */
function offBearing(c: number, cam: { x: number; z: number }) {
  const a = columnAngle(c);
  const b = Math.atan2(cam.z, cam.x);
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

describe("arcade columns (Phase 1, task 1.2)", () => {
  // Default view, the drag limits, the idle sway, and a phone's farther camera.
  const views = [
    cameraAt(CAMERA.azimuthDeg, CAMERA.elevationDeg),
    cameraAt(CAMERA.azimuthDeg + CAMERA.swayDeg, ORBIT.elevationMinDeg),
    cameraAt(CAMERA.azimuthDeg - CAMERA.swayDeg, ORBIT.elevationMaxDeg),
    cameraAt(200, ORBIT.elevationMinDeg, CAMERA.distance * 1.55),
    cameraAt(-90, CAMERA.elevationDeg, CAMERA.distance * 1.55),
  ];

  it("never draws the columns in front of the camera", () => {
    for (const cam of views) {
      // The arc between the camera's two tangents to the ring faces it from outside.
      const tangent = Math.acos(MATAF.arcadeRadius / Math.hypot(cam.x, cam.z));
      const front = Array.from({ length: ARCADE.columnsPerTier }, (_, c) => c).filter(
        (c) => offBearing(c, cam) < tangent - 0.01,
      );
      expect(front.length).toBeGreaterThan(0);
      for (const c of front) expect(columnBehindMataf(c, cam.x, cam.z)).toBe(false);
    }
    // At the default view that is everything within about 37° of the camera's bearing.
    const cam = views[0]!;
    for (let c = 0; c < ARCADE.columnsPerTier; c++) {
      if (offBearing(c, cam) < 35 * DEG) expect(columnBehindMataf(c, cam.x, cam.z)).toBe(false);
    }
  });

  it("keeps every column behind the mataf, the backdrop round the Kaaba", () => {
    for (const cam of views) {
      for (let c = 0; c < ARCADE.columnsPerTier; c++) {
        if (offBearing(c, cam) > 90 * DEG) expect(columnBehindMataf(c, cam.x, cam.z)).toBe(true);
      }
    }
  });

  it("drops the columns exactly where the inner-faced cornices drop out", () => {
    // A cornice face shows from the camera when its outward normal points away
    // from it: past the tangent from the camera to the ring.
    for (const cam of views) {
      const tangent = Math.acos(MATAF.arcadeRadius / Math.hypot(cam.x, cam.z));
      for (let c = 0; c < ARCADE.columnsPerTier; c++) {
        const off = offBearing(c, cam);
        if (Math.abs(off - tangent) < 0.01) continue;
        expect(columnBehindMataf(c, cam.x, cam.z)).toBe(off > tangent);
      }
    }
  });
});
