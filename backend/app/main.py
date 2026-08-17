# App FastAPI do Contador LCR (sem autenticação)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import exames

# Cria a aplicação
app = FastAPI(title="Contador LCR API", version="1.0.0")

# Libera o frontend local (Vite) para chamar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra rotas de exames
app.include_router(exames.router)


@app.get("/")
def health():
    # Endpoint simples para checar se a API está no ar
    return {"ok": True, "app": "Contador LCR API"}
