# Banco SQLite — Contador LCR

Não usa Docker nem PostgreSQL. O arquivo fica em `data/contador_lcr.db` na raiz do projeto.

Na primeira execução o backend cria a tabela `exames` sozinho.

`seed.sql` é **MOCK DE TESTE** (pytest). Não rode no banco do laboratório.

Cópia de segurança: copie `data/contador_lcr.db` para outro disco.
