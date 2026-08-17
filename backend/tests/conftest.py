import json
import socket
from datetime import date
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.database import get_db
from app.main import app

TEST_DB_URL = "postgresql+psycopg2://lcr:lcr123@127.0.0.1:5433/contador_lcr_test"
SCHEMA_SQL = Path(__file__).resolve().parents[2] / "bd" / "schema.sql"
SEED_SQL = Path(__file__).resolve().parents[2] / "bd" / "seed.sql"
FORMULA_CASOS = (
    Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "formula_casos.json"
)


def postgres_teste_no_ar() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 5433), timeout=1):
            return True
    except OSError:
        return False


@pytest.fixture(scope="session")
def formula_casos():
    return json.loads(FORMULA_CASOS.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def pg_engine():
    if not postgres_teste_no_ar():
        pytest.skip("Postgres de teste não está na porta 5433")
    engine = create_engine(TEST_DB_URL)
    ddl = SCHEMA_SQL.read_text(encoding="utf-8")
    with engine.begin() as conn:
        for stmt in ddl.split(";"):
            stmt = stmt.strip()
            if stmt:
                conn.execute(text(stmt))
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(pg_engine):
    Session = sessionmaker(bind=pg_engine, autocommit=False, autoflush=False)
    session = Session()
    session.execute(text("TRUNCATE TABLE exames RESTART IDENTITY"))
    session.commit()
    try:
        yield session
    finally:
        session.rollback()
        session.execute(text("TRUNCATE TABLE exames RESTART IDENTITY"))
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
