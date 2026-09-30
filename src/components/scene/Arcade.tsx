"use client";

import { useLayoutEffect, useRef } from "react";
import { BackSide, type InstancedMesh, Object3D } from "three";
import { MATAF } from "./lib/layout";
import { PALETTE } from "./lib/palette";

const COLUMNS_PER_TIER = 96;
const TIERS = [
  { base: 0, height: 7.5 },
  { base: 9, height: 6.5 },
] as const;

/**
 * The mosque's colonnades as a quiet silhouette ringing the mataf: columns
 * and cornices against a warm glow, so the Kaaba sits inside a place rather
 * than floating in a void. One instanced mesh for every column.
 */
export function Arcade() {
  const columns = useRef<InstancedMesh>(null);
  const r = MATAF.arcadeRadius;

  useLayoutEffect(() => {
    const mesh = columns.current;
    if (!mesh) return;
    const dummy = new Object3D();
    let i = 0;
    for (const tier of TIERS) {
      for (let c = 0; c < COLUMNS_PER_TIER; c++) {
        const a = (c / COLUMNS_PER_TIER) * Math.PI * 2;
        dummy.position.set(
          r * Math.cos(a),
          tier.base + tier.height / 2,
          r * Math.sin(a),
        );
        dummy.rotation.set(0, -a, 0);
        dummy.scale.set(1, tier.height, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [r]);

  return (
    <group>
      <instancedMesh
        ref={columns}
        args={[undefined, undefined, COLUMNS_PER_TIER * TIERS.length]}
      >
        <boxGeometry args={[0.7, 1, 0.9]} />
        <meshStandardMaterial
          color={PALETTE.stone}
          roughness={0.9}
          envMapIntensity={0}
        />
      </instancedMesh>

      {/* Cornices above each tier. */}
      {TIERS.map((tier) => (
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
