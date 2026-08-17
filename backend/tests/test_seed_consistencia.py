from pathlib import Path

import pytest
from sqlalchemy import text

from app.calculo import celulas_por_ul

pytestmark = pytest.mark.postgres

SEED_SQL = Path(__file__).resolve().parents[2] / "bd" / "seed.sql"


def test_seed_leucocitos_zero_e_formula_proxima(db_session):
    db_session.execute(text(SEED_SQL.read_text(encoding="utf-8")))
    db_session.commit()

    rows = db_session.execute(
        text(
            """
            SELECT leucocitos, leucocitos_ul, quadrantes_leuco, diluicao_leuco,
                   hemacias, hemacias_ul, quadrantes_hema, diluicao_hema
            FROM exames
            """
        )
    ).all()
    assert len(rows) == 12

    for r in rows:
        if r.leucocitos == 0:
            assert float(r.leucocitos_ul) == 0
        esperado_l = celulas_por_ul(
            r.leucocitos, float(r.diluicao_leuco), float(r.quadrantes_leuco)
        )
        assert abs(float(r.leucocitos_ul) - esperado_l) <= 1.0

        esperado_h = celulas_por_ul(
            r.hemacias, float(r.diluicao_hema), float(r.quadrantes_hema)
        )
        assert abs(float(r.hemacias_ul) - esperado_h) <= 1.0
