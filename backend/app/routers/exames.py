# Rotas de exames: listar, detalhar, criar e exportar CSV
import csv
import io
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exame
from app.schemas import ExameCreate, ExameOut
from app.calculo import aplicar_calculo

router = APIRouter(prefix="/exames", tags=["exames"])


@router.get("", response_model=list[ExameOut])
def listar_exames(
    q: str | None = Query(None, description="Busca em prontuário/operador/paciente/obs"),
    data_inicial: date | None = None,
    data_final: date | None = None,
    db: Session = Depends(get_db),
):
    # Lista exames com filtros opcionais
    query = db.query(Exame)

    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Exame.prontuario).like(like),
                func.lower(Exame.operador).like(like),
                func.lower(Exame.paciente).like(like),
                func.lower(Exame.observacoes).like(like),
            )
        )

    if data_inicial:
        query = query.filter(Exame.data_exame >= data_inicial)
    if data_final:
        query = query.filter(Exame.data_exame <= data_final)

    return query.order_by(Exame.data_exame.desc(), Exame.id.desc()).all()


@router.get("/export/csv")
def exportar_csv(
    q: str | None = None,
    data_inicial: date | None = None,
    data_final: date | None = None,
    db: Session = Depends(get_db),
):
    # Gera CSV dos exames filtrados para download
    exames = listar_exames(q=q, data_inicial=data_inicial, data_final=data_final, db=db)

    buffer = io.StringIO()
    writer = csv.writer(buffer, delimiter=";")
    writer.writerow(
        [
            "data",
            "operador",
            "prontuario",
            "paciente",
            "leucocitos_uL",
            "hemacias_uL",
            "poli_pct",
            "mono_pct",
            "observacoes",
        ]
    )
    for e in exames:
        writer.writerow(
            [
                e.data_exame.strftime("%d/%m/%Y"),
                e.operador,
                e.prontuario,
                e.paciente or "",
                float(e.leucocitos_ul),
                float(e.hemacias_ul),
                float(e.poli_pct),
                float(e.mono_pct),
                (e.observacoes or "").replace("\n", " "),
            ]
        )

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=exames_lcr.csv"},
    )


@router.get("/{exame_id}", response_model=ExameOut)
def obter_exame(exame_id: int, db: Session = Depends(get_db)):
    # Retorna um exame pelo id
    exame = db.query(Exame).filter(Exame.id == exame_id).first()
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return exame


@router.post("", response_model=ExameOut, status_code=201)
def criar_exame(payload: ExameCreate, db: Session = Depends(get_db)):
    # Recalcula céls/µL e percentuais no servidor (não confia no cliente)
    dados = aplicar_calculo(payload.model_dump())
    exame = Exame(**dados)
    db.add(exame)
    db.commit()
    db.refresh(exame)
    return exame
