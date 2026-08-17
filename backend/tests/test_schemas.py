from datetime import date

from pydantic import ValidationError
import pytest

from app.calculo import aplicar_calculo, celulas_por_ul
from app.schemas import ExameCreate


def _base(**overrides):
    dados = {
        "data_exame": date(2026, 8, 16),
        "operador": "Ana",
        "prontuario": "PR-1",
        "quadrantes_leuco": 4,
        "diluicao_leuco": 1,
        "leucocitos": 1,
        "leucocitos_ul": 9999,
        "quadrantes_hema": 1,
        "diluicao_hema": 1,
        "hemacias": 1,
        "hemacias_ul": 8888,
        "poli": 1,
        "mono": 1,
        "poli_pct": 50,
        "mono_pct": 50,
    }
    dados.update(overrides)
    return dados


def test_ignora_ul_e_pct_do_cliente():
    out = aplicar_calculo(_base())
    assert out["leucocitos_ul"] == round(celulas_por_ul(1, 1, 4), 2)
    assert out["hemacias_ul"] == round(celulas_por_ul(1, 1, 1), 2)
    assert out["poli_pct"] == 50.0
    assert out["mono_pct"] == 50.0
    assert out["leucocitos_ul"] != 9999
    assert out["hemacias_ul"] != 8888


def test_round_duas_casas():
    out = aplicar_calculo(_base(leucocitos=59, quadrantes_leuco=4, diluicao_leuco=1))
    assert out["leucocitos_ul"] == 147.5


def test_schema_operador_vazio():
    with pytest.raises(ValidationError):
        ExameCreate(**_base(operador=""))


def test_schema_prontuario_vazio():
    with pytest.raises(ValidationError):
        ExameCreate(**_base(prontuario=""))


def test_schema_quadrantes_menor_que_um():
    with pytest.raises(ValidationError):
        ExameCreate(**_base(quadrantes_leuco=0))
    with pytest.raises(ValidationError):
        ExameCreate(**_base(quadrantes_hema=0.5))


def test_schema_diluicao_nao_positiva():
    with pytest.raises(ValidationError):
        ExameCreate(**_base(diluicao_leuco=0))
    with pytest.raises(ValidationError):
        ExameCreate(**_base(diluicao_hema=-1))


def test_schema_contagens_negativas():
    with pytest.raises(ValidationError):
        ExameCreate(**_base(leucocitos=-1))
    with pytest.raises(ValidationError):
        ExameCreate(**_base(hemacias=-1))
    with pytest.raises(ValidationError):
        ExameCreate(**_base(poli=-1))
    with pytest.raises(ValidationError):
        ExameCreate(**_base(mono=-1))
