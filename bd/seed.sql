-- MOCK DE TESTE — remover ou limpar em produção
-- Popula a Consulta com exames fictícios para visualizar a tabela

INSERT INTO exames (
  data_exame, operador, prontuario, paciente,
  quadrantes_leuco, diluicao_leuco, leucocitos, leucocitos_ul,
  quadrantes_hema, diluicao_hema, hemacias, hemacias_ul,
  poli, mono, poli_pct, mono_pct, observacoes
) VALUES
('2026-07-16', 'Ana Ribeiro', 'PR-100234', 'João Batista de Souza',
  4, 1, 1, 3, 4, 1, 5, 12, 1, 4, 20, 80, 'Amostra límpida, incolor.'),
('2026-07-17', 'Ana Ribeiro', 'PR-100235', 'Maria Aparecida Lima',
  4, 1, 59, 148, 4, 1, 16, 40, 41, 9, 82, 18, 'Aspecto turvo. Suspeita de meningite bacteriana.'),
('2026-07-18', 'Carlos Menezes', 'PR-100240', 'Pedro Henrique Alves',
  4, 1, 25, 62, 4, 1, 6, 15, 6, 19, 24, 76, 'Predomínio mononuclear.'),
('2026-07-19', 'Carlos Menezes', 'PR-100241', 'Luiza Ferreira',
  4, 1, 0, 0, 4, 1, 1, 2, 0, 5, 0, 100, 'Sem alterações relevantes.'),
('2026-07-20', 'Beatriz Nunes', 'PR-100255', 'Antônio Carlos Vieira',
  4, 1, 128, 320, 4, 1, 600, 1500, 90, 10, 90, 10, 'Amostra hemorrágica, contagem com cautela.'),
('2026-07-21', 'Beatriz Nunes', 'PR-100256', 'Fernanda Souza',
  4, 1, 8, 20, 4, 1, 3, 8, 2, 8, 20, 80, 'Ligeira xantocromia.'),
('2026-07-22', 'Ana Ribeiro', 'PR-100260', 'Roberto Dias',
  4, 1, 2, 5, 4, 1, 0, 0, 1, 4, 20, 80, 'Dentro da normalidade.'),
('2026-07-23', 'Carlos Menezes', 'PR-100270', 'Juliana Costa',
  4, 2, 40, 200, 4, 1, 10, 25, 30, 10, 75, 25, 'Diluição 1:2 aplicada nos leucócitos.'),
('2026-07-24', 'Beatriz Nunes', 'PR-100280', 'Marcos Paulo',
  4, 1, 15, 38, 4, 1, 4, 10, 5, 20, 20, 80, 'Contagem em duplicata.'),
('2026-07-25', 'Ana Ribeiro', 'PR-100290', 'Helena Martins',
  4, 1, 3, 8, 4, 1, 2, 5, 0, 10, 0, 100, 'Amostra límpida.'),
('2026-07-26', 'Carlos Menezes', 'PR-100300', 'Paulo Sérgio',
  4, 1, 90, 225, 4, 1, 20, 50, 70, 20, 78, 22, 'Pleocitose com predomínio de poli.'),
('2026-07-27', 'Beatriz Nunes', 'PR-100310', 'Carla Mendes',
  4, 1, 6, 15, 4, 1, 1, 3, 2, 8, 20, 80, 'Sem coágulo.');
