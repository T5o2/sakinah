"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  type InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { TAWAF } from "@/lib/config/scene";
import { createWalkerGeometry } from "./figures/walkers";
import { CLEARANCE } from "./lib/layout";
import {
  createWalkers,
  type Walker,
  type WalkerKind,
  walkerHeading,
  walkerPosition,
} from "./lib/tawaf";

const KINDS: WalkerKind[] = ["ihram", "abaya", "carrier"];
/** Frames to wait before showing the crowd: the contact shadows are drawn once, without it. */
const HIDDEN_FRAMES = 2;

const matrix = new Matrix4();
const position = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3();
const yAxis = new Vector3(0, 1, 0);
const zAxis = new Vector3(0, 0, 1);
const roll = new Quaternion();

/** Places one walker at time `t`: on its lane, facing its way, with a light walking bob. */
function writeWalker(mesh: InstancedMesh, i: number, w: Walker, t: number) {
  const p = walkerPosition(w, t);
  const [h0, h1] = TAWAF.heightScale;
  const s = h0 + (h1 - h0) * w.variation;
  // One bob per step, steps following the distance walked along the lane.
  const walked = w.omega * (CLEARANCE.base + w.offset) * t;
  const step = w.phase + Math.PI * TAWAF.stepsPerMetre * walked;
  position.set(p.x, TAWAF.bob * Math.abs(Math.sin(step)), p.z);
  rotation.setFromAxisAngle(yAxis, walkerHeading(w, t));
  roll.setFromAxisAngle(zAxis, 0.025 * Math.sin(step));
  rotation.multiply(roll);
  scale.setScalar(s);
  mesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
}

/**
 * The people performing tawaf, counterclockwise with the Kaaba on their
 * left: one instanced mesh per kind (three draw calls for the whole crowd).
 * Under prefers-reduced-motion they stand still where they are.
 */
export function TawafCrowd({ count, still }: { count: number; still: boolean }) {
  const walkers = useMemo(() => createWalkers(count), [count]);
  const groups = useMemo(
    () => KINDS.map((kind) => walkers.filter((w) => w.kind === kind)),
    [walkers],
  );
  const geometries = useMemo(() => KINDS.map(createWalkerGeometry), []);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const frames = useRef(0);

  // Placed and tinted before the first draw, so the shader is built with
  // per-instance colour: a slight brightness spread keeps the white varied.
  useLayoutEffect(() => {
    const tint = new Color();
    groups.forEach((group, k) => {
      const mesh = meshes.current[k];
      if (!mesh) return;
      group.forEach((w, i) => {
        writeWalker(mesh, i, w, 0);
        mesh.setColorAt(i, tint.setScalar(0.9 + 0.1 * w.variation));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }, [groups]);

  useFrame(({ clock, invalidate }) => {
    // Hidden for the scene's first frames only (meshes made later, e.g. when
    // the device tier changes, show at once).
    const show = frames.current >= HIDDEN_FRAMES;
    meshes.current.forEach((m) => m && (m.visible = show));
    if (!show) {
      frames.current++;
      // On-demand rendering (reduced motion) needs another frame to show them.
      invalidate();
      return;
    }
    if (still) return;
    const t = clock.elapsedTime;
    groups.forEach((group, k) => {
      const mesh = meshes.current[k];
      if (!mesh) return;
      group.forEach((w, i) => writeWalker(mesh, i, w, t));
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <>
      {groups.map((group, k) => (
        <instancedMesh
          key={KINDS[k]}
          ref={(m) => {
            meshes.current[k] = m;
            // Out of the contact shadows, which are drawn in the first frame.
            if (m && frames.current < HIDDEN_FRAMES) m.visible = false;
          }}
          args={[geometries[k], undefined, group.length]}
          frustumCulled={false}
        >
          {/* Matte cloth and skin, coloured per vertex. */}
          <meshStandardMaterial vertexColors roughness={0.85} metalness={0} />
        </instancedMesh>
      ))}
    </>
  );
}
