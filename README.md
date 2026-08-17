# Contador LCR

Aplicativo de contagem celular de LCR para laboratório clínico.

**Stack:**

- `frontend/` — React + TypeScript (Vite)
- `backend/` — Python + FastAPI
- `bd/` — PostgreSQL (Docker Compose)

Sem autenticação. Sem Electron. Sem Google Sheets — apenas **Baixar CSV** na Consulta.

**Não exponha na internet.** Qualquer um na rede pode ler e gravar exames.

Repositório: https://github.com/BrunoFOmena/Contador_LCR

---

## Branches

| Branch | Uso |
|---|---|
| `main` | Produção. Só recebe merge de `hotfix` ou de `develop` estável. CI + E2E + imagens GHCR. |
| `develop` | Integração. Novas `feature` e `fix` entram aqui. |
| `feature` | Base para funcionalidades. Trabalhe em `feature/<nome>` a partir dela. |
| `fix` | Base para correções não urgentes. Trabalhe em `fix/<nome>`. |
| `hotfix` | Correção urgente em produção. Crie `hotfix/<nome>` a partir de `main` e depois mescle em `main` **e** em `develop`. |

```powershell
git checkout feature
git checkout -b feature/minha-ideia

git checkout fix
git checkout -b fix/corrige-data

git checkout main
git checkout -b hotfix/corrige-calculo
```

Abra um Pull Request da sua branch para `develop` (`feature`/`fix`) ou para `main` (`hotfix`).

---

## Desenvolvimento local

### 1) Banco (`bd`)

Se o PostgreSQL do Windows estiver na porta **5432**, pare o serviço antes:

```powershell
Stop-Service postgresql-x64-16
```

```powershell
cd bd
docker compose up -d
```

Na primeira subida o volume recebe tabelas e seed mock. Subidas seguintes **não** apagam exames.

> `bd/seed.sql` é **MOCK DE TESTE**.

### 2) Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 3) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Abra: http://localhost:5173

---

## Testes (máquina local)

```powershell
cd bd
docker compose --profile test up -d postgres_test

cd ..\backend
pytest

cd ..\frontend
npm test

# E2E: backend na 8000 + Postgres na 5432
cd ..\e2e
npx playwright install chromium
npx playwright test
```

No GitHub Actions o CI roda pytest e Vitest em `main`, `develop`, `feature`, `fix` e `hotfix`. Playwright e publicação de imagens só em push na `main`.

---

## Laboratório (imagens GHCR)

Push na `main` com CI verde publica:

- `ghcr.io/brunofomena/contador-lcr-backend`
- `ghcr.io/brunofomena/contador-lcr-frontend`

No PC do lab (Docker instalado):

```powershell
cd contador_lcr
copy .env.prod.example .env
# edite POSTGRES_PASSWORD no .env

docker login ghcr.io
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Abra http://localhost (porta 80). O Nginx do frontend encaminha `/api` para o backend. **Não** aplica seed.

Se o pacote GHCR estiver público, o `docker login` pode ser omitido.

---

## Fluxo de uso

1. **Registro** — operador e prontuário
2. **Contador CEL.** — teclas/botões 1–6
3. **Laudo** — Salvar registro (limpa a tela e vai para a Consulta)
4. **Consulta** — filtrar, navegar na tabela, **Baixar CSV**

Se a API estiver fora, a Consulta mostra lista vazia (não usa mock).

---

## Estrutura

```text
contador_lcr/
  .github/workflows/  # CI + publish GHCR
  bd/                 # schema, seed, compose de desenvolvimento
  backend/            # FastAPI + pytest
  frontend/           # React + Vitest
  e2e/                # Playwright
  docker-compose.prod.yml
  tests/              # fixtures da fórmula
  README.md
```

## Fórmula

`células/µL = total contado ÷ (nº quadrantes × 0,1) × diluição`

Cada quadrante grande da Neubauer tem 0,1 µL. Padrão: leucócitos em 4 cantos; hemácias em 1 quadrante central (editável).
