import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { celulasPorUL, formatarNumero, percentual } from "./calculo";

const casos = JSON.parse(
  readFileSync(
    resolve(__dirname, "../../../tests/fixtures/formula_casos.json"),
    "utf8"
  )
) as {
  celulas: Array<{
    id: string;
    total: number;
    diluicao: number;
    quadrantes: number;
    esperado: number;
  }>;
  percentual: Array<{
    id: string;
    parte: number;
    total: number;
    esperado: number;
  }>;
};

describe("celulasPorUL", () => {
  it.each(casos.celulas)("$id", (caso) => {
    expect(
      celulasPorUL(caso.total, caso.diluicao, caso.quadrantes)
    ).toBeCloseTo(caso.esperado, 8);
  });
});

describe("percentual", () => {
  it.each(casos.percentual)("$id", (caso) => {
    expect(percentual(caso.parte, caso.total)).toBeCloseTo(caso.esperado, 8);
  });
});

describe("formatarNumero", () => {
  it("formata em pt-BR com 0 casas", () => {
    expect(formatarNumero(147.5, 0)).toMatch(/148|147/);
  });

  it("respeita casas decimais", () => {
    const texto = formatarNumero(2.5, 1);
    expect(texto).toContain("2");
  });
});
