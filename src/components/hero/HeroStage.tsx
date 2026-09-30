"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useState } from "react";

const HaramScene = dynamic(() => import("@/components/scene/HaramScene"), { ssr: false });

/** Full-bleed stage behind the hero text: the 3D scene fades in once drawn. */
export function HeroStage() {
  const reducedMotion = useReducedMotion() ?? false;
  const [drawn, setDrawn] = useState(false);

  return (
    <div
      className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${drawn ? "opacity-100" : "opacity-0"}`}
    >
      <HaramScene reducedMotion={reducedMotion} onFirstFrame={() => setDrawn(true)} />
    </div>
  );
}
