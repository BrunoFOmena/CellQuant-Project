# Contador LCR

Aplicativo de contagem celular de LCR para laboratório clínico.

**Stack:**

- `frontend/` — React + TypeScript (Vite)
- `backend/` — Python + FastAPI
- `data/contador_lcr.db` — SQLite (criado na primeira execução)

Sem Docker. Sem PostgreSQL. Sem autenticação. Sem Electron. Sem Google Sheets — apenas **Baixar CSV** na Consulta.

**Não exponha na internet.** Qualquer um na rede pode ler e gravar exames.

Repositório: https://github.com/BrunoFOmena/Contador_LCR

---

## Laboratório (um clique)

No PC precisa só de **Python 3** (já no PATH) e um navegador.

1. Copie a pasta `contador_lcr` para o computador.
2. Dê dois cliques em `iniciar.bat` (ou `.\iniciar.ps1`).
3. Abra http://127.0.0.1:8000 se o navegador não abrir sozinho.

Na primeira vez o script cria um `.venv`, instala os pacotes Python do projeto e, se o Node estiver disponível, gera a interface. Os exames ficam em `data/contador_lcr.db` — copie esse arquivo para backup.

Se a pasta `frontend/dist` ainda não existir e não houver Node, rode uma vez (em qualquer PC com Node):

```powershell
cd frontend
npm install
npm run build
```

Depois leve a pasta inteira ao laboratório. Lá só o Python é necessário.

---

## Branches

| Branch | Uso |
|---|---|
| `main` | Produção. Só recebe merge de `hotfix` ou de `develop` estável. |
| `develop` | Integração. Novas `feature` e `fix` entram aqui. |
| `feature` | Base para funcionalidades. |
| `fix` | Base para correções não urgentes. |
| `hotfix` | Correção urgente em produção. |

A `main` não recebe push direto: o GitHub exige PR com os checks **backend**, **frontend** e **CI** verdes.

---

## Desenvolvimento local

### 1) Backend (SQLite)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- Saúde: http://localhost:8000/health
- Docs: http://localhost:8000/docs

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Abra: http://localhost:5173 — o Vite encaminha `/exames` para a API.

---

## Testes (máquina local)

```powershell
cd backend
pytest

cd ..\frontend
npm test

# E2E: backend na 8000 (SQLite) + Vite na 5173
cd ..\e2e
npx playwright install chromium
npx playwright test
```

No GitHub Actions o CI roda pytest (SQLite em memória) e Vitest. Playwright só em push na `main`.

---

## Fluxo de uso

1. **Registro** — operador e prontuário
2. **Contador celular** — teclas/botões 1–6
3. **Laudo** — Salvar registro (limpa a tela e vai para a Consulta)
4. **Consulta** — filtrar, navegar na tabela, **Baixar CSV**

Se a API estiver fora, a Consulta mostra lista vazia (não usa mock).

---

## Estrutura

```text
contador_lcr/
  iniciar.bat / iniciar.ps1
  data/                 # SQLite (nao versionado)
  bd/                   # schema e seed de teste
  backend/              # FastAPI + pytest
  frontend/             # React + Vitest
  e2e/                  # Playwright
  tests/                # fixtures da fórmula
  README.md
```

## Fórmula

`células/µL = total contado ÷ (nº quadrantes × 0,1) × diluição`

Cada quadrante grande da Neubauer tem 0,1 µL. Padrão: leucócitos em 4 cantos; hemácias em 1 quadrante central (editável).
