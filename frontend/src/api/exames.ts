// Chamadas HTTP para a API FastAPI
import type { Exame, ExameCreate } from "../types/exame";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type FiltrosExame = {
  q?: string;
  data_inicial?: string;
  data_final?: string;
};

// Lista exames com filtros opcionais
export async function listarExames(filtros: FiltrosExame = {}): Promise<Exame[]> {
  const params = new URLSearchParams();
  if (filtros.q) params.set("q", filtros.q);
  if (filtros.data_inicial) params.set("data_inicial", filtros.data_inicial);
  if (filtros.data_final) params.set("data_final", filtros.data_final);

  const qs = params.toString();
  const res = await fetch(`${API_URL}/exames${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Falha ao listar exames");
  return res.json();
}

// Salva exame do Laudo
export async function criarExame(payload: ExameCreate): Promise<Exame> {
  const res = await fetch(`${API_URL}/exames`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Falha ao salvar exame");
  return res.json();
}
