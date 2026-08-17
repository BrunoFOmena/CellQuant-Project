import { describe, expect, it } from "vitest";
import { montarConteudoCsv } from "./csv";
import type { Exame } from "../types/exame";

const exame: Exame = {
  id: 1,
  data_exame: "2026-08-16",
  operador: "Ana",
  prontuario: "PR-1",
  paciente: "João",
  quadrantes_leuco: 4,
  diluicao_leuco: 1,
  leucocitos: 1,
  leucocitos_ul: 2.5,
  quadrantes_hema: 1,
  diluicao_hema: 1,
  hemacias: 1,
  hemacias_ul: 10,
  poli: 1,
  mono: 1,
  poli_pct: 50,
  mono_pct: 50,
  observacoes: "nota; com ponto e virgula\nsegunda linha",
};

describe("montarConteudoCsv", () => {
  it("usa ponto e virgula como separador e limpa obs", () => {
    const csv = montarConteudoCsv([exame]);
    const linhas = csv.split("\n");
    expect(linhas[0]).toBe(
      "data;operador;prontuario;paciente;leucocitos_uL;hemacias_uL;poli_pct;mono_pct;observacoes"
    );
    expect(linhas[1]).toContain("PR-1");
    expect(linhas[1]).toContain("nota, com ponto e virgula segunda linha");
    expect(linhas[1]).not.toContain("nota;");
  });

  it("paciente vazio vira string vazia", () => {
    const csv = montarConteudoCsv([{ ...exame, paciente: null, observacoes: null }]);
    expect(csv.split("\n")[1].split(";")[3]).toBe("");
  });
});
