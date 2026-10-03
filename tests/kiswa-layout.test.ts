import { describe, expect, it } from "vitest";
import {
  BELOW_BELT_GAP,
  DROP_WIDTH,
  belowBeltRun,
  type BelowBeltItem,
} from "../src/components/scene/lib/kiswaAtlas";

/** [x0, x1] of every item, left to right. */
function spans(items: BelowBeltItem[]): [number, number][] {
  return items
    .map((it): [number, number] =>
      "panel" in it
        ? [it.panel - it.width / 2, it.panel + it.width / 2]
        : [it.drop - DROP_WIDTH / 2, it.drop + DROP_WIDTH / 2],
    )
    .sort((a, b) => a[0] - b[0]);
}

describe("panels and drops below the belt", () => {
  const left = 0.8;
  const right = 11.1;

  it("alternates drop and panel, with a drop at each end", () => {
    const items = belowBeltRun(left, right, 2);
    const kinds = items.map((it) => ("panel" in it ? "panel" : "drop"));
    expect(kinds).toEqual(["drop", "panel", "drop", "panel", "drop"]);
  });

  it("leaves one equal gap between every two neighbours", () => {
    const s = spans(belowBeltRun(left, right, 2));
    const gaps = [s[0]![0] - left];
    for (let i = 1; i < s.length; i++) gaps.push(s[i]![0] - s[i - 1]![1]);
    gaps.push(right - s[s.length - 1]![1]);
    for (const g of gaps) expect(g).toBeCloseTo(BELOW_BELT_GAP, 9);
  });

  it("is symmetric about the middle of its stretch", () => {
    const s = spans(belowBeltRun(left, right, 2));
    const mid = (left + right) / 2;
    for (let i = 0; i < s.length; i++) {
      const mirror = s[s.length - 1 - i]!;
      expect(s[i]![0] - mid).toBeCloseTo(mid - mirror[1], 9);
    }
  });

  it("refuses a stretch too short for its panels", () => {
    expect(() => belowBeltRun(0, 1, 2)).toThrow();
  });
});
