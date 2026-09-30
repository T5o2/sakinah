"use client";

import { MAQAM } from "./lib/layout";
import { PALETTE } from "./lib/palette";

const GOLD = { color: PALETTE.gold, metalness: 0.8, roughness: 0.3, envMapIntensity: 2.2 } as const;

/**
 * Maqam Ibrahim: a gold-framed, bell-shaped glass enclosure on a marble
 * plinth, in front of the door. Kept small and simple at hero distance.
 */
export function MaqamIbrahim() {
  return (
    <group position={[MAQAM.x, 0, MAQAM.z]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.36, 8]} />
        <meshStandardMaterial color={PALETTE.marble} roughness={0.4} />
      </mesh>
      {/* Glass body with a gold rim top and bottom. */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 1.2, 8]} />
        <meshStandardMaterial color="#3a3222" metalness={0.6} roughness={0.15} envMapIntensity={2} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.12, 8]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.1, 8]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* Bell-shaped gold crown. */}
      <mesh position={[0, 1.58, 0]} scale={[1, 1.35, 1]}>
        <sphereGeometry args={[0.56, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.07, 0.4, 6]} />
        <meshStandardMaterial {...GOLD} color={PALETTE.goldSoft} />
      </mesh>
    </group>
  );
}
