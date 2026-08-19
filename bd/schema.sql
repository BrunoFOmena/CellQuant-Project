-- Tabela exames — SQLite (criada automaticamente na primeira execução)
CREATE TABLE IF NOT EXISTS exames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_exame DATE NOT NULL,
  operador VARCHAR(120) NOT NULL,
  prontuario VARCHAR(80) NOT NULL,
  paciente VARCHAR(160),
  quadrantes_leuco NUMERIC(10, 2) NOT NULL DEFAULT 4,
  diluicao_leuco NUMERIC(10, 2) NOT NULL DEFAULT 1,
  leucocitos INTEGER NOT NULL DEFAULT 0,
  leucocitos_ul NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quadrantes_hema NUMERIC(10, 2) NOT NULL DEFAULT 1,
  diluicao_hema NUMERIC(10, 2) NOT NULL DEFAULT 1,
  hemacias INTEGER NOT NULL DEFAULT 0,
  hemacias_ul NUMERIC(12, 2) NOT NULL DEFAULT 0,
  poli INTEGER NOT NULL DEFAULT 0,
  mono INTEGER NOT NULL DEFAULT 0,
  poli_pct NUMERIC(6, 2) NOT NULL DEFAULT 0,
  mono_pct NUMERIC(6, 2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exames_prontuario ON exames (prontuario);
CREATE INDEX IF NOT EXISTS idx_exames_data ON exames (data_exame);
