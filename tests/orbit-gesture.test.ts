import { describe, expect, it } from "vitest";
import {
  createOrbitGesture,
  type PointerKind,
} from "../src/components/scene/lib/orbitGesture";
import { CAMERA, ORBIT } from "../src/lib/config/scene";

const at = (
  x: number,
  y: number,
  t: number,
  kind: PointerKind = "mouse",
  id = 1,
) => ({ id, kind, x, y, t });

describe("orbit gesture", () => {
  it("treats a quick, still press as a tap and does not turn the view", () => {
    const g = createOrbitGesture();
    g.down(at(100, 100, 0));
    g.move(at(102, 101, 50));
    expect(g.up(at(102, 101, 120))).toBe(true);
    expect(g.state.azimuthDeg).toBe(CAMERA.azimuthDeg);
  });

  it("does not tap after a drag, and turns the view instead", () => {
    const g = createOrbitGesture();
    g.down(at(100, 100, 0));
    g.move(at(160, 100, 40));
    expect(g.up(at(160, 100, 80))).toBe(false);
    expect(g.state.azimuthDeg).not.toBe(CAMERA.azimuthDeg);
  });

  it("does not tap on a long, still press", () => {
    const g = createOrbitGesture();
    g.down(at(100, 100, 0));
    expect(g.up(at(100, 100, ORBIT.tapMaxMs + 200))).toBe(false);
  });

  it("dragging right turns the scene right (camera azimuth decreases)", () => {
    const g = createOrbitGesture();
    g.down(at(0, 0, 0));
    g.move(at(10, 0, 10)); // crosses the tap threshold
    const before = g.state.azimuthDeg;
    g.move(at(110, 0, 20));
    expect(g.state.azimuthDeg).toBeCloseTo(before - 100 * ORBIT.degPerPx, 6);
  });

  it("clamps elevation for mouse drags", () => {
    const g = createOrbitGesture();
    g.down(at(0, 0, 0));
    g.move(at(0, 5000, 10));
    expect(g.state.elevationDeg).toBe(ORBIT.elevationMaxDeg);
    g.move(at(0, -5000, 20));
    expect(g.state.elevationDeg).toBe(ORBIT.elevationMinDeg);
  });

  it("ignores vertical movement on touch (the page scrolls instead)", () => {
    const g = createOrbitGesture();
    g.down(at(0, 0, 0, "touch"));
    g.move(at(0, 300, 10, "touch"));
    expect(g.state.elevationDeg).toBe(CAMERA.elevationDeg);
  });

  it("a cancelled press (browser took the scroll) is neither tap nor drag", () => {
    const g = createOrbitGesture();
    g.down(at(0, 0, 0, "touch"));
    g.cancel();
    expect(g.up(at(0, 0, 50, "touch"))).toBe(false);
    expect(g.state.dragging).toBe(false);
  });

  it("records when the drag last moved, for the idle sway to wait on", () => {
    const g = createOrbitGesture();
    g.down(at(0, 0, 0));
    g.move(at(50, 0, 300));
    g.up(at(50, 0, 400));
    expect(g.state.lastInteraction).toBe(400);
  });

  it("follows only the pointer that started the press", () => {
    const g = createOrbitGesture();
    g.down(at(0, 0, 0, "touch", 1));
    g.move(at(200, 0, 10, "touch", 2));
    expect(g.state.azimuthDeg).toBe(CAMERA.azimuthDeg);
  });
});
