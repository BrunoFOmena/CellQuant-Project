// Gera e baixa um arquivo CSV no navegador
import type { Exame } from "../types/exame";
import { formatarDataBr } from "./data";

export function montarConteudoCsv(exames: Exame[]): string {
  const headers = [
    "data",
    "operador",
    "prontuario",
    "paciente",
    "leucocitos_uL",
    "hemacias_uL",
    "poli_pct",
    "mono_pct",
    "observacoes",
  ];

  const linhas = exames.map((e) =>
    [
      formatarDataBr(e.data_exame),
      e.operador,
      e.prontuario,
      e.paciente || "",
      e.leucocitos_ul,
      e.hemacias_ul,
      e.poli_pct,
      e.mono_pct,
      (e.observacoes || "").replaceAll(";", ",").replaceAll("\n", " "),
    ].join(";")
  );

  return [headers.join(";"), ...linhas].join("\n");
}

export function baixarCsv(exames: Exame[], nomeArquivo = "exames_lcr.csv") {
  const conteudo = montarConteudoCsv(exames);
  const blob = new Blob(["\uFEFF" + conteudo], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}
