# Backend — Contador LCR (FastAPI + SQLite)

Na raiz do projeto: `cellquant start` (laboratório) ou `cellquant start --reload` / `cellquant dev` (desenvolvimento).

## Subir à mão

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- Saúde: http://localhost:8000/health
- Docs: http://localhost:8000/docs
- App (se `frontend/dist` existir): http://localhost:8000

O SQLite é criado em `data/contador_lcr.db`.

## Endpoints

- `GET /health`
- `GET /exames`
- `GET /exames/{id}`
- `POST /exames`
- `GET /exames/export/csv`
