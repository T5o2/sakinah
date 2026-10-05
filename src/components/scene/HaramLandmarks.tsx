"use client";

import { useEffect, useMemo } from "react";
import { DoubleSide, Vector2 } from "three";
import { buildLandmarkGeometries } from "./landmarks/index";
import { createKiswaTextures } from "./lib/kiswaAtlas";
import { PALETTE } from "./lib/palette";
import {
  createHijrBandTexture,
  createGraniteTexture,
  createHijrGateTexture,
  createMaqamLatticeTexture,
} from "./lib/textures";

const EMBROIDERY_RELIEF = new Vector2(1, 1);

/**
 * The Kaaba, Hijr Ismail and Maqam Ibrahim in ten draw calls: one per
 * material, with detail carried by merged geometry, vertex colours and
 * painted textures.
 */
export function HaramLandmarks({ atlasWidth }: { atlasWidth: number }) {
  const geometries = useMemo(() => buildLandmarkGeometries(), []);
  const kiswa = useMemo(() => createKiswaTextures(atlasWidth), [atlasWidth]);
  const small = useMemo(
    () => ({
      lattice: createMaqamLatticeTexture(),
      band: createHijrBandTexture(),
      gate: createHijrGateTexture(),
      granite: createGraniteTexture(),
    }),
    [],
  );

  useEffect(
    () => () => Object.values(geometries).forEach((g) => g.dispose()),
    [geometries],
  );
  useEffect(
    () => () => Object.values(kiswa).forEach((t) => t.dispose()),
    [kiswa],
  );
  useEffect(
    () => () => Object.values(small).forEach((t) => t.dispose()),
    [small],
  );

  return (
    <group>
      {/* Stones, white cloth, woven kiswa, belt, panels, lanterns and curtain — one atlas. */}
      <mesh geometry={geometries.kiswa}>
        <meshStandardMaterial
          map={kiswa.color}
          emissiveMap={kiswa.color}
          emissive="#ffffff"
          emissiveIntensity={0.14}
          aoMap={kiswa.orm}
          roughnessMap={kiswa.orm}
          metalnessMap={kiswa.orm}
          normalMap={kiswa.normal}
          normalScale={EMBROIDERY_RELIEF}
          roughness={1}
          metalness={1}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* Marble and stone: shadharwan, roof and rim, Hijr wall, Maqam plinth and stone. */}
      <mesh geometry={geometries.matte}>
        <meshStandardMaterial vertexColors roughness={0.42} />
      </mesh>

      {/* Gold and bronze: mizab, shadharwan rings, lanterns, gates, Maqam cage. */}
      <mesh geometry={geometries.metal}>
        <meshStandardMaterial
          vertexColors
          metalness={0.85}
          roughness={0.3}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* Polished silver: the Black Stone's frame. */}
      <mesh geometry={geometries.silver}>
        {/* Mirror-polished, so it catches the lights from across the mataf;
            a faint glow keeps it reading where it faces the dark sky. */}
        <meshStandardMaterial
          vertexColors
          metalness={0.8}
          roughness={0.16}
          envMapIntensity={4}
          emissive="#c4c4c8"
          emissiveIntensity={0.24}
        />
      </mesh>

      {/* Dark green glass of the Hijr lanterns, glowing dimly. */}
      <mesh geometry={geometries.lanternGlass}>
        <meshStandardMaterial
          vertexColors
          emissive={PALETTE.lanternGlow}
          emissiveIntensity={0.35}
          roughness={0.12}
          metalness={0.1}
          envMapIntensity={1.5}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Inlay band along the Hijr wall's outer face. */}
      <mesh geometry={geometries.hijrBand}>
        <meshStandardMaterial map={small.band} roughness={0.42} />
      </mesh>

      {/* Dark granite strip set flush into the floor round the Kaaba. */}
      <mesh geometry={geometries.floorStrip}>
        <meshStandardMaterial
          map={small.granite}
          roughness={0.55}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>

      {/* Low latticed gold gates at the Hijr openings. */}
      <mesh geometry={geometries.hijrGates}>
        <meshStandardMaterial
          map={small.gate}
          emissiveMap={small.gate}
          emissive="#ffffff"
          emissiveIntensity={0.3}
          alphaTest={0.5}
          side={DoubleSide}
          metalness={0.8}
          roughness={0.25}
          envMapIntensity={2.6}
        />
      </mesh>

      {/* Maqam cage: latticed glass. */}
      <mesh geometry={geometries.maqamLattice}>
        <meshStandardMaterial
          map={small.lattice}
          emissiveMap={small.lattice}
          emissive="#ffffff"
          emissiveIntensity={0.04}
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
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
