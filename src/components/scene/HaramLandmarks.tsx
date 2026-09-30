"use client";

import { useEffect, useMemo } from "react";
import { DoubleSide } from "three";
import { buildLandmarkGeometries } from "./landmarks/index";
import { createKiswaTextures } from "./lib/kiswaAtlas";
import { PALETTE } from "./lib/palette";
import { createMaqamLatticeTexture } from "./lib/textures";

/**
 * The Kaaba, Hijr Ismail and Maqam Ibrahim in six draw calls: one per
 * material, with detail carried by merged geometry, vertex colours and the
 * painted kiswa atlas.
 */
export function HaramLandmarks({ atlasWidth }: { atlasWidth: number }) {
  const geometries = useMemo(() => buildLandmarkGeometries(), []);
  const kiswa = useMemo(() => createKiswaTextures(atlasWidth), [atlasWidth]);
  const lattice = useMemo(() => createMaqamLatticeTexture(), []);

  useEffect(
    () => () => Object.values(geometries).forEach((g) => g.dispose()),
    [geometries],
  );
  useEffect(
    () => () => {
      kiswa.color.dispose();
      kiswa.orm.dispose();
    },
    [kiswa],
  );
  useEffect(() => () => lattice.dispose(), [lattice]);

  return (
    <group>
      {/* Kiswa, white cloth, belt, panels, lanterns and door — one painted atlas. */}
      <mesh geometry={geometries.kiswa}>
        <meshStandardMaterial
          map={kiswa.color}
          emissiveMap={kiswa.color}
          emissive="#ffffff"
          emissiveIntensity={0.16}
          aoMap={kiswa.orm}
          roughnessMap={kiswa.orm}
          metalnessMap={kiswa.orm}
          roughness={1}
          metalness={1}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* Marble and stone: shadharwan, Hijr wall, Maqam plinth, the Black Stone. */}
      <mesh geometry={geometries.matte}>
        <meshStandardMaterial vertexColors roughness={0.42} />
      </mesh>

      {/* Gold, silver and bronze: door frame, mizab, Black Stone frame, lamp posts, Maqam cage. */}
      <mesh geometry={geometries.metal}>
        <meshStandardMaterial
          vertexColors
          metalness={0.85}
          roughness={0.3}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* Green glass of the Hijr lanterns, glowing softly. */}
      <mesh geometry={geometries.lanternGlass}>
        <meshStandardMaterial
          vertexColors
          emissive={PALETTE.lanternGlow}
          emissiveIntensity={0.9}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Maqam cage: latticed glass. */}
      <mesh geometry={geometries.maqamLattice}>
        <meshStandardMaterial
          map={lattice}
          emissiveMap={lattice}
          emissive="#ffffff"
          emissiveIntensity={0.18}
          metalness={0.6}
          roughness={0.25}
          envMapIntensity={2}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <mesh geometry={geometries.maqamDome}>
        <meshStandardMaterial
          color={PALETTE.maqamGlass}
          metalness={0.2}
          roughness={0.05}
          envMapIntensity={2}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
