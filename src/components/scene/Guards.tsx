"use client";

import { useEffect, useMemo } from "react";
import { createGuardsGeometry } from "./figures/guards";

/** The four guards round the Kaaba, standing still: one draw call. */
export function Guards() {
  const geometry = useMemo(() => createGuardsGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      {/* Matte cloth, skin and boots, coloured per vertex. */}
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0} />
    </mesh>
  );
}
