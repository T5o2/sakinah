"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, type InstancedMesh, Matrix4, Object3D } from "three";
import { ARCADE, columnAngle, columnBehindMataf } from "./lib/arcade";
import { MATAF } from "./lib/layout";
import { PALETTE } from "./lib/palette";

const { columnsPerTier, tiers } = ARCADE;

/**
 * The mosque's colonnades as a quiet silhouette ringing the mataf: columns
 * and cornices against a warm glow, so the Kaaba sits inside a place rather
 * than floating in a void. One instanced mesh for every column, drawing only
 * the columns behind the mataf: those on the camera's side would stand in
 * front of the scene as tall black slabs.
 */
export function Arcade() {
  const columns = useRef<InstancedMesh>(null);
  const r = MATAF.arcadeRadius;

  // Each column's placement, by tier then angle.
  const matrices = useMemo(() => {
    const dummy = new Object3D();
    return tiers.map((tier) =>
      Array.from({ length: columnsPerTier }, (_, c) => {
        const a = columnAngle(c);
        dummy.position.set(r * Math.cos(a), tier.base + tier.height / 2, r * Math.sin(a));
        dummy.rotation.set(0, -a, 0);
        dummy.scale.set(1, tier.height, 1);
        dummy.updateMatrix();
        return new Matrix4().copy(dummy.matrix);
      }),
    );
  }, [r]);

  // Which columns were drawn last, to rewrite the instances only when it changes.
  const shown = useRef<boolean[]>([]);

  useFrame(({ camera, invalidate }) => {
    const mesh = columns.current;
    if (!mesh) return;
    const { x, z } = camera.position;
    // Until the camera rig has placed the camera (outside the ring), draw
    // none, and ask for another frame (on-demand rendering under reduced motion).
    if (Math.hypot(x, z) <= r) {
      mesh.count = 0;
      shown.current = [];
      invalidate();
      return;
    }
    const now = Array.from({ length: columnsPerTier }, (_, c) => columnBehindMataf(c, x, z));
    if (now.every((v, c) => v === shown.current[c])) return;
    shown.current = now;
    // This runs before the camera rig moves the camera this frame: draw one
    // more frame, so the columns settle on where the camera ends up.
    invalidate();
    let i = 0;
    for (const tier of matrices) {
      tier.forEach((m, c) => {
        if (now[c]) mesh.setMatrixAt(i++, m);
      });
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={columns}
        args={[undefined, undefined, columnsPerTier * tiers.length]}
        count={0}
        // The ring surrounds the whole scene, so some of it is always in view;
        // and a bounds sphere taken while no column is drawn would hide it for good.
        frustumCulled={false}
      >
        <boxGeometry args={[0.7, 1, 0.9]} />
        <meshStandardMaterial
          color={PALETTE.stone}
          roughness={0.9}
          envMapIntensity={0}
        />
      </instancedMesh>

      {/* Cornices above each tier. */}
      {tiers.map((tier) => (
        <mesh key={tier.base} position={[0, tier.base + tier.height + 0.6, 0]}>
          <cylinderGeometry args={[r, r, 1.2, 96, 1, true]} />
          <meshStandardMaterial
            color={PALETTE.stone}
            roughness={0.9}
            envMapIntensity={0}
            side={BackSide}
          />
        </mesh>
      ))}

      {/* Warm lamplight behind the arches. */}
      <mesh position={[0, 8.5, 0]}>
        <cylinderGeometry args={[r + 3, r + 3, 17, 96, 1, true]} />
        <meshBasicMaterial color={PALETTE.arcadeGlow} side={BackSide} />
      </mesh>
    </group>
  );
}
