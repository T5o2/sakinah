"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  type BufferGeometry,
  Color,
  InstancedBufferAttribute,
  type InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { TAWAF } from "@/lib/config/scene";
import { createWalkerMaterial } from "./figures/walkerMaterial";
import { createWalkerGeometry, walkerLook } from "./figures/walkers";
import {
  createWalkers,
  type Walker,
  type WalkerKind,
  walkerHeading,
  walkerPosition,
  walkerStep,
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

interface Group {
  walkers: Walker[];
  geometry: BufferGeometry;
  /** Per instance: hair style, step phase (updated every frame). */
  look: InstancedBufferAttribute;
}

/**
 * Places walker `i` of a group at time `t`: on its lane, facing its way, the
 * body rising over each step and rolling slightly from foot to foot; and
 * hands the step phase to the shader that swings legs, arms and hem.
 */
function writeWalker(mesh: InstancedMesh, group: Group, i: number, t: number) {
  const w = group.walkers[i]!;
  const p = walkerPosition(w, t);
  const step = walkerStep(w, t);
  const [h0, h1] = TAWAF.heightScale;
  position.set(p.x, TAWAF.bob * Math.abs(Math.cos(step)), p.z);
  rotation.setFromAxisAngle(yAxis, walkerHeading(w, t));
  roll.setFromAxisAngle(zAxis, 0.02 * Math.sin(step));
  rotation.multiply(roll);
  scale.setScalar(h0 + (h1 - h0) * w.variation);
  mesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
  group.look.setY(i, step);
}

/**
 * The people performing tawaf, counterclockwise with the Kaaba on their
 * left: one instanced mesh per kind (three draw calls for the whole crowd),
 * each walker with its own skin and hair. Under prefers-reduced-motion they
 * stand still where they are.
 */
export function TawafCrowd({ count, still }: { count: number; still: boolean }) {
  const groups = useMemo<Group[]>(() => {
    const walkers = createWalkers(count);
    const colour = new Color();
    return KINDS.map((kind) => {
      const members = walkers
        .map((w, index) => ({ w, index }))
        .filter(({ w }) => w.kind === kind);
      const geometry = createWalkerGeometry(kind);
      const n = members.length;
      const skin = new Float32Array(n * 3);
      const hair = new Float32Array(n * 3);
      const look = new Float32Array(n * 2);
      members.forEach(({ index }, i) => {
        const l = walkerLook(index);
        colour.set(l.skin).toArray(skin, i * 3);
        colour.set(l.hair).toArray(hair, i * 3);
        look[i * 2] = l.style;
      });
      geometry.setAttribute("aSkin", new InstancedBufferAttribute(skin, 3));
      geometry.setAttribute("aHair", new InstancedBufferAttribute(hair, 3));
      const lookAttr = new InstancedBufferAttribute(look, 2);
      geometry.setAttribute("aLook", lookAttr);
      return { walkers: members.map(({ w }) => w), geometry, look: lookAttr };
    });
  }, [count]);
  useEffect(
    () => () => groups.forEach((g) => g.geometry.dispose()),
    [groups],
  );

  const material = useMemo(() => createWalkerMaterial(), []);
  useEffect(() => () => material.dispose(), [material]);

  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const frames = useRef(0);

  // Placed before the first draw (and again whenever the crowd is rebuilt).
  useLayoutEffect(() => {
    groups.forEach((group, k) => {
      const mesh = meshes.current[k];
      if (!mesh) return;
      group.walkers.forEach((_, i) => writeWalker(mesh, group, i, 0));
      mesh.instanceMatrix.needsUpdate = true;
      group.look.needsUpdate = true;
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
      group.walkers.forEach((_, i) => writeWalker(mesh, group, i, t));
      mesh.instanceMatrix.needsUpdate = true;
      group.look.needsUpdate = true;
    });
  });

  return (
    <>
      {groups.map((group, k) => (
        <instancedMesh
          key={`${KINDS[k]}-${count}`}
          ref={(m) => {
            meshes.current[k] = m;
            // Out of the contact shadows, which are drawn in the first frame.
            if (m && frames.current < HIDDEN_FRAMES) m.visible = false;
          }}
          args={[group.geometry, material, group.walkers.length]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}
