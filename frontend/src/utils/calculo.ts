// Cálculo de células/µL e percentual do diferencial

// Fórmula: total ÷ (quadrantes × 0,1) × diluição  (= total × diluição × 10 / quadrantes)
export function celulasPorUL(
  total: number,
  diluicao: number,
  quadrantes: number
): number {
  if (!diluicao || !quadrantes || diluicao <= 0 || quadrantes <= 0) return 0;
  return (total * diluicao * 10) / quadrantes;
}

// Percentual de uma parte sobre o total diferencial
export function percentual(parte: number, total: number): number {
  if (!total) return 0;
  return (parte * 100) / total;
}

export function formatarNumero(n: number, casas = 0): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}
