# Conexão com o PostgreSQL via SQLAlchemy
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Carrega variáveis do arquivo .env
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://lcr:lcr123@localhost:5432/contador_lcr",
)

# Engine = ponte com o banco
engine = create_engine(DATABASE_URL)

# SessionLocal = fábrica de sessões por request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    # Base dos models ORM
    pass


def get_db():
    # Entrega uma sessão e fecha ao fim do request
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
