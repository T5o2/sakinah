import { describe, expect, it } from "vitest";
import {
  detectDeviceTier,
  lowerTier,
} from "../src/components/scene/lib/deviceTier";
import {
  INTRO,
  TIER_SETTINGS,
  TRANSITION,
  WALKER_MIX,
} from "../src/lib/config/scene";

describe("scene config", () => {
  it("walker mix sums to 1", () => {
    const total =
      WALKER_MIX.ihram + WALKER_MIX.abaya + WALKER_MIX.carrier + WALKER_MIX.mother;
    // Walking children are taken out of the adults, on top of the mix.
    expect(WALKER_MIX.child).toBeGreaterThan(0.03);
    expect(WALKER_MIX.child).toBeLessThan(0.04);
    expect(total).toBeCloseTo(1, 10);
  });

  it("lower tiers never draw more than higher ones", () => {
    const { high, medium, low } = TIER_SETTINGS;
    expect(medium.walkers).toBeLessThan(high.walkers);
    expect(low.walkers).toBeLessThan(medium.walkers);
    expect(medium.pigeons).toBeLessThanOrEqual(high.pigeons);
    expect(low.pigeons).toBeLessThanOrEqual(medium.pigeons);
    expect(medium.dpr[1]).toBeLessThanOrEqual(1.5);
    expect(low.dpr[1]).toBe(1);
  });

  it("welcome sequence stays under 4 seconds (SPEC §3.1)", () => {
    const total = INTRO.fadeInMs + 3 * INTRO.lineMs + INTRO.fadeOutMs;
    expect(total).toBeLessThan(4000);
  });

  it("cinematic transition is about 1.2 seconds (SPEC §3.3)", () => {
    expect(TRANSITION.dollyMs + TRANSITION.goldFadeMs).toBe(1200);
  });
});

describe("device tier", () => {
  const desktop = {
    cores: 8,
    memoryGb: 8,
    coarsePointer: false,
    viewportWidth: 1440,
  };

  it("starts capable desktops on high", () => {
    expect(detectDeviceTier(desktop)).toBe("high");
  });

  it("starts phones on medium", () => {
    expect(
      detectDeviceTier({ ...desktop, coarsePointer: true, viewportWidth: 390 }),
    ).toBe("medium");
  });

  it("starts weak devices on low", () => {
    expect(detectDeviceTier({ ...desktop, memoryGb: 2 })).toBe("low");
    expect(detectDeviceTier({ ...desktop, cores: 2 })).toBe("low");
  });

  it("steps down one tier at a time and stops at low", () => {
    expect(lowerTier("high")).toBe("medium");
    expect(lowerTier("medium")).toBe("low");
    expect(lowerTier("low")).toBe("low");
  });
});
