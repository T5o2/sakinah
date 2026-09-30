"use client";

import { useEffect, useMemo } from "react";
import { MATAF } from "./lib/layout";
import { createFloorTexture } from "./lib/textures";

/** Pale marble mataf, brightest under the Kaaba and fading into the night. */
export function MatafFloor({ textureSize }: { textureSize: number }) {
  const texture = useMemo(() => createFloorTexture(textureSize), [textureSize]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[MATAF.radius, 96]} />
      <meshStandardMaterial map={texture} roughness={0.5} metalness={0} />
    </mesh>
  );
}
