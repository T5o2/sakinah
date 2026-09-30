"use client";

import { useEffect, useMemo } from "react";
import { HALF_X, HALF_Z, KAABA } from "./lib/layout";
import { PALETTE } from "./lib/palette";
import { createBeltTexture, createDoorTexture } from "./lib/textures";

/** Belt frieze tile length in metres (texture is 8:1 on a 0.95 m band). */
const BELT_TILE_METRES = KAABA.beltHeight * 8;

/** Gold reads under night light: strong reflections plus a faint glow from its own pattern. */
const GOLD = { metalness: 0.8, roughness: 0.32, envMapIntensity: 2.2, emissive: "#ffffff", emissiveIntensity: 0.22 } as const;

/**
 * The Kaaba: black kiswa, gold belt and door, marble base, the Black Stone's
 * silver frame and the gold waterspout (mizab) over Hijr Ismail.
 * Ornament is abstract geometry only — no calligraphy (see textures.ts).
 */
export function Kaaba({ sheen }: { sheen: boolean }) {
  const textures = useMemo(() => {
    const beltLong = createBeltTexture(); // door wall and its opposite (length sizeX)
    const beltShort = beltLong.clone(); // Hijr wall and its opposite (length sizeZ)
    beltLong.repeat.set(KAABA.sizeX / BELT_TILE_METRES, 1);
    beltShort.repeat.set(KAABA.sizeZ / BELT_TILE_METRES, 1);
    beltShort.needsUpdate = true;
    return { beltLong, beltShort, door: createDoorTexture() };
  }, []);

  useEffect(
    () => () => {
      for (const texture of Object.values(textures)) texture.dispose();
    },
    [textures],
  );

  const { sizeX, sizeZ, height, door } = KAABA;
  const doorX = -HALF_X + door.fromBlackStoneCorner;
  const beltInset = 0.03;

  return (
    <group>
      {/* Shadharwan: marble base around the foot of the walls. */}
      <mesh position={[0, KAABA.baseHeight / 2, 0]}>
        <boxGeometry
          args={[sizeX + KAABA.baseOutset * 2, KAABA.baseHeight, sizeZ + KAABA.baseOutset * 2]}
        />
        <meshStandardMaterial color={PALETTE.marble} roughness={0.45} />
      </mesh>

      {/* Kiswa. */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[sizeX, height, sizeZ]} />
        {sheen ? (
          <meshPhysicalMaterial
            color={PALETTE.kiswa}
            roughness={0.85}
            envMapIntensity={0.25}
            sheen={0.6}
            sheenRoughness={0.55}
            sheenColor={PALETTE.kiswaSheen}
          />
        ) : (
          <meshStandardMaterial color={PALETTE.kiswa} roughness={0.85} envMapIntensity={0.25} />
        )}
      </mesh>
      {/* Roof: faces the overhead light panels, so it ignores their reflection to stay black. */}
      <mesh position={[0, height + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[sizeX, sizeZ]} />
        <meshStandardMaterial color={PALETTE.kiswa} roughness={0.95} envMapIntensity={0} />
      </mesh>

      {/* Hizam: gold belt two thirds of the way up. Face order: +x, -x, +y, -y, +z, -z. */}
      <mesh position={[0, KAABA.beltY, 0]}>
        <boxGeometry args={[sizeX + beltInset * 2, KAABA.beltHeight, sizeZ + beltInset * 2]} />
        <meshStandardMaterial attach="material-0" map={textures.beltShort} emissiveMap={textures.beltShort} {...GOLD} />
        <meshStandardMaterial attach="material-1" map={textures.beltShort} emissiveMap={textures.beltShort} {...GOLD} />
        <meshStandardMaterial attach="material-2" color={PALETTE.kiswa} />
        <meshStandardMaterial attach="material-3" color={PALETTE.kiswa} />
        <meshStandardMaterial attach="material-4" map={textures.beltLong} emissiveMap={textures.beltLong} {...GOLD} />
        <meshStandardMaterial attach="material-5" map={textures.beltLong} emissiveMap={textures.beltLong} {...GOLD} />
      </mesh>

      {/* Door, on the north-east wall near the Black Stone corner. */}
      <group position={[doorX, door.bottom + door.height / 2, HALF_Z]}>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[door.width + 0.35, door.height + 0.35, 0.12]} />
          <meshStandardMaterial color={PALETTE.goldDeep} metalness={0.8} roughness={0.4} envMapIntensity={1.6} />
        </mesh>
        <mesh position={[0, 0, 0.125]}>
          <planeGeometry args={[door.width, door.height]} />
          <meshStandardMaterial map={textures.door} emissiveMap={textures.door} {...GOLD} />
        </mesh>
      </group>

      {/* Black Stone: silver frame set into the east corner, facing outwards. */}
      <group position={[-HALF_X - 0.08, KAABA.blackStoneHeight, HALF_Z + 0.08]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh scale={[1, 1.3, 1]}>
          <torusGeometry args={[0.26, 0.07, 8, 20]} />
          <meshStandardMaterial color={PALETTE.silver} metalness={1} roughness={0.28} envMapIntensity={2} />
        </mesh>
        <mesh scale={[1, 1.3, 1]} position={[0, 0, -0.02]}>
          <circleGeometry args={[0.24, 20]} />
          <meshStandardMaterial color="#1b1716" roughness={0.6} />
        </mesh>
      </group>

      {/* Mizab: gold waterspout over Hijr Ismail. */}
      <mesh position={[HALF_X + 0.7, height - 0.25, 0]}>
        <boxGeometry args={[1.4, 0.22, 0.32]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.8} roughness={0.3} envMapIntensity={2.2} />
      </mesh>
    </group>
  );
}
