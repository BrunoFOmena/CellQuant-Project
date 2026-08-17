# Schemas Pydantic (entrada/saída da API)
from datetime import date, datetime
from pydantic import BaseModel, Field


class ExameCreate(BaseModel):
    # Payload para criar exame a partir do Laudo.
    # leucocitos_ul / hemacias_ul / poli_pct / mono_pct são ignorados:
    # o servidor recalcula a partir dos totais, quadrantes e diluição.
    data_exame: date
    operador: str = Field(min_length=1)
    prontuario: str = Field(min_length=1)
    paciente: str | None = None
    quadrantes_leuco: float = Field(default=4, ge=1)
    diluicao_leuco: float = Field(default=1, gt=0)
    leucocitos: int = Field(default=0, ge=0)
    leucocitos_ul: float = 0
    quadrantes_hema: float = Field(default=1, ge=1)
    diluicao_hema: float = Field(default=1, gt=0)
    hemacias: int = Field(default=0, ge=0)
    hemacias_ul: float = 0
    poli: int = Field(default=0, ge=0)
    mono: int = Field(default=0, ge=0)
    poli_pct: float = 0
    mono_pct: float = 0
    observacoes: str | None = None


class ExameOut(ExameCreate):
    # Resposta da API com id e timestamp
    id: int
    criado_em: datetime

    model_config = {"from_attributes": True}
