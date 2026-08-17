# Backend — Contador LCR (FastAPI)

## Subir

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Endpoints

- `GET /exames`
- `GET /exames/{id}`
- `POST /exames`
- `GET /exames/export/csv`
