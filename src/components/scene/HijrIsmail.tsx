"use client";

import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { HIJR } from "./lib/layout";
import { PALETTE } from "./lib/palette";

const SEGMENTS = 40;

/** Low marble wall of Hijr Ismail: an elliptical arc off the north-west wall. */
function createHijrGeometry(): ExtrudeGeometry {
  const half = (HIJR.arcHalfAngleDeg * Math.PI) / 180;
  const t = HIJR.thickness / 2;
  const point = (phi: number, grow: number): [number, number] => [
    HIJR.centerX + (HIJR.radiusX + grow) * Math.cos(phi),
    (HIJR.radiusZ + grow) * Math.sin(phi),
  ];

  const shape = new Shape();
  shape.moveTo(...point(-half, t));
  for (let i = 1; i <= SEGMENTS; i++) shape.lineTo(...point(-half + (2 * half * i) / SEGMENTS, t));
  for (let i = SEGMENTS; i >= 0; i--) shape.lineTo(...point(-half + (2 * half * i) / SEGMENTS, -t));
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, { depth: HIJR.height, bevelEnabled: false });
  // Shape plane (x, y) → floor (x, -z); extrusion becomes height (+y).
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export function HijrIsmail() {
  const geometry = useMemo(() => createHijrGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={PALETTE.marble} roughness={0.4} />
    </mesh>
  );
}
