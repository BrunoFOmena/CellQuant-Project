# Conexão SQLite — arquivo local, sem Docker nem Postgres
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

# Raiz do repositório (contador_lcr/)
ROOT = Path(__file__).resolve().parents[2]
DB_FILE = ROOT / "data" / "contador_lcr.db"


def _url_padrao() -> str:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    return "sqlite:///" + DB_FILE.resolve().as_posix()


DATABASE_URL = os.getenv("DATABASE_URL") or _url_padrao()

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(engine, "connect")
def _pragma_sqlite(dbapi_conn, _connection_record):
    if not DATABASE_URL.startswith("sqlite"):
        return
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
