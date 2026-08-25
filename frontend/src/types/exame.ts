// Tipos do exame LCR usados no frontend

export type Exame = {
  id: number;
  data_exame: string;
  operador: string;
  prontuario: string;
  paciente?: string | null;
  quadrantes_leuco: number;
  diluicao_leuco: number;
  leucocitos: number;
  leucocitos_ul: number;
  quadrantes_hema: number;
  diluicao_hema: number;
  hemacias: number;
  hemacias_ul: number;
  poli: number;
  mono: number;
  poli_pct: number;
  mono_pct: number;
  observacoes?: string | null;
  criado_em?: string;
};

export type ExameCreate = Omit<Exame, "id" | "criado_em">;

export type ContagemState = {
  leuco: number;
  hema: number;
  poli: number;
  mono: number;
  historico: Array<"L" | "E" | "N" | "M">;
};

export type RegistroState = {
  operador: string;
  prontuario: string;
  paciente: string;
  data_exame: string;
  quadrantes_leuco: number;
  diluicao_leuco: number;
  quadrantes_hema: number;
  diluicao_hema: number;
  observacoes: string;
};

export type Secao = "contador" | "manual" | "tabela" | "estatistica";

export type Aba =
  | "registro"
  | "contador"
  | "laudo"
  | "consulta"
  | "metodologia"
  | "significado";
