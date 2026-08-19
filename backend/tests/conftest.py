import json
from datetime import date
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Exame  # noqa: F401

FORMULA_CASOS = (
    Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "formula_casos.json"
)


@pytest.fixture(scope="session")
def formula_casos():
    return json.loads(FORMULA_CASOS.read_text(encoding="utf-8"))


@pytest.fixture()
def sqlite_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(sqlite_engine):
    Session = sessionmaker(bind=sqlite_engine, autocommit=False, autoflush=False)
    session = Session()
    session.execute(text("DELETE FROM exames"))
    session.commit()
    try:
        yield session
    finally:
        session.rollback()
        session.execute(text("DELETE FROM exames"))
        session.commit()
        session.close()


@pytest.fixture()
def client(db_session):
    def _get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def payload_exame(**overrides):
    base = {
        "data_exame": date(2026, 8, 16).isoformat(),
        "operador": "Ana Ribeiro",
        "prontuario": "PR-TEST-001",
        "paciente": "Paciente Teste",
        "quadrantes_leuco": 4,
        "diluicao_leuco": 1,
        "leucocitos": 1,
        "leucocitos_ul": 9999,
        "quadrantes_hema": 1,
        "diluicao_hema": 1,
        "hemacias": 1,
        "hemacias_ul": 8888,
        "poli": 1,
        "mono": 3,
        "poli_pct": 99,
        "mono_pct": 99,
        "observacoes": "obs teste",
    }
    base.update(overrides)
    return base
