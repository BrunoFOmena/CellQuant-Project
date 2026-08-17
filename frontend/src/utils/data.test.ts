import { describe, expect, it } from "vitest";
import { dataCivilLocal } from "./data";

describe("dataCivilLocal", () => {
  it("usa o dia civil local, nao UTC", () => {
    const d = new Date(2026, 7, 16, 21, 40, 0);
    expect(dataCivilLocal(d)).toBe("2026-08-16");
  });

  it("preenche mes e dia com zero a esquerda", () => {
    const d = new Date(2026, 0, 5, 8, 0, 0);
    expect(dataCivilLocal(d)).toBe("2026-01-05");
  });
});
