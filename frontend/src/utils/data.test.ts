import { describe, expect, it } from "vitest";
import {
  dataCivilLocal,
  formatarDataBr,
  isoDeDataBr,
  mascararDigitacaoData,
} from "./data";

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

describe("formatarDataBr", () => {
  it("mostra dia/mes/ano", () => {
    expect(formatarDataBr("2026-08-16")).toBe("16/08/2026");
    expect(formatarDataBr("2026-01-05")).toBe("05/01/2026");
  });
});

describe("isoDeDataBr", () => {
  it("converte dd/mm/aaaa para ISO", () => {
    expect(isoDeDataBr("16/08/2026")).toBe("2026-08-16");
    expect(isoDeDataBr("31/02/2026")).toBeNull();
  });
});

describe("mascararDigitacaoData", () => {
  it("insere barras no padrao brasileiro", () => {
    expect(mascararDigitacaoData("16082026")).toBe("16/08/2026");
  });
});
