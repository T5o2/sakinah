import { describe, expect, it } from "vitest";
import ar from "../messages/ar.json";
import en from "../messages/en.json";

type Catalogue = { [key: string]: string | Catalogue };

/** Flattens a nested catalogue into dotted key paths with their values. */
function flatten(catalogue: Catalogue, prefix = ""): Map<string, string> {
  const entries = new Map<string, string>();
  for (const [key, value] of Object.entries(catalogue)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") entries.set(path, value);
    else for (const [k, v] of flatten(value, path)) entries.set(k, v);
  }
  return entries;
}

const catalogues = { ar: flatten(ar), en: flatten(en) };

describe("translation catalogues", () => {
  it("ar.json and en.json have exactly the same keys", () => {
    const arKeys = [...catalogues.ar.keys()].sort();
    const enKeys = [...catalogues.en.keys()].sort();
    expect(enKeys).toEqual(arKeys);
  });

  it.each(Object.entries(catalogues))("%s.json has no empty strings", (_, entries) => {
    const empty = [...entries].filter(([, value]) => value.trim() === "").map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it("en.json contains no Arabic script (catches untranslated copy)", () => {
    const arabic = /[؀-ۿ]/;
    const leaked = [...catalogues.en].filter(([, v]) => arabic.test(v)).map(([k]) => k);
    expect(leaked).toEqual([]);
  });
});
