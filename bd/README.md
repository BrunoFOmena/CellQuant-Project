# Banco de dados — Contador LCR

**Caminho atual (desenvolvimento):** PostgreSQL via Docker Compose.

Produção (Docker vs Postgres instalado no Windows vs serviço gerenciado) ainda está em aberto.

## 1) Subir com Docker (padrão)

Se o PostgreSQL instalado no Windows estiver na porta **5432**, pare o serviço antes:

```powershell
Get-Service *postgres*
Stop-Service postgresql-x64-16
```

(O nome exato pode variar.)

```powershell
cd bd
docker compose up -d
```

- Usuário `lcr` / senha `lcr123` / banco `contador_lcr`
- `schema.sql` + `seed.sql` (**MOCK DE TESTE**) só na **primeira** criação do volume
- `docker compose up -d` de novo **não** apaga exames

Parar:

```powershell
docker compose down
```

(`down` não remove o volume. `down -v` apaga os dados — não use se houver exames reais.)

## Testes (Postgres isolado na porta 5433)

Não usa o banco de desenvolvimento. Schema só, sem seed.

```powershell
cd bd
docker compose --profile test up -d postgres_test
```

Depois, em `backend/`: `pytest` (os testes marcados `postgres` são ignorados se a 5433 estiver fora).

## 2) Alternativa: Postgres instalado no Windows

Só use se não quiser Docker. Não rode os dois ao mesmo tempo na porta 5432.

```powershell
cd bd
Set-ExecutionPolicy -Scope Process Bypass
.\setup_windows.ps1
```

O script cria usuário/banco e aplica o schema. O seed mock **só entra se a tabela estiver vazia** — nunca faz `TRUNCATE` em cima de exames existentes.

## Dados de conexão (backend)

| Campo | Valor |
|---|---|
| Host | localhost |
| Porta | 5432 |
| Usuário | lcr |
| Senha | lcr123 |
| Banco | contador_lcr |

```text
DATABASE_URL=postgresql+psycopg2://lcr:lcr123@localhost:5432/contador_lcr
```

Já está no arquivo `backend/.env` / `backend/.env.example`.

## Arquivos

| Arquivo | Função |
|---|---|
| `docker-compose.yml` | Caminho padrão de desenvolvimento |
| `schema.sql` | Tabela `exames` |
| `seed.sql` | Dados mock de teste (só volume/banco novo) |
| `setup_windows.ps1` | Alternativa sem Docker |
