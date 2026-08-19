# App FastAPI do Contador LCR (SQLite + UI estática, sem autenticação)
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.models import Exame  # noqa: F401 — registra a tabela no metadata
from app.routers import exames

DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not os.getenv("PYTEST_CURRENT_TEST"):
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Contador LCR API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exames.router)


@app.get("/health")
def health():
    return {"ok": True, "app": "Contador LCR API"}


if DIST.is_dir():
    app.mount("/", StaticFiles(directory=DIST, html=True), name="ui")
