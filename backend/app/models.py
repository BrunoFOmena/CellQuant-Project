# Model ORM da tabela exames
from datetime import date, datetime
from sqlalchemy import Date, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Exame(Base):
    # Representa um exame de contagem de LCR salvo
    __tablename__ = "exames"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    data_exame: Mapped[date] = mapped_column(Date, nullable=False)
    operador: Mapped[str] = mapped_column(String(120), nullable=False)
    prontuario: Mapped[str] = mapped_column(String(80), nullable=False)
    paciente: Mapped[str | None] = mapped_column(String(160), nullable=True)

    quadrantes_leuco: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=4)
    diluicao_leuco: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=1)
    leucocitos: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    leucocitos_ul: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    quadrantes_hema: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=1)
    diluicao_hema: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=1)
    hemacias: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hemacias_ul: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    poli: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mono: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    poli_pct: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    mono_pct: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)

    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
