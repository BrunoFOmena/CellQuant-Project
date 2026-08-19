import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError


def test_defaults_e_indices(db_session):
    row = db_session.execute(
        text(
            """
            INSERT INTO exames (data_exame, operador, prontuario)
            VALUES ('2026-01-01', 'Tecnico', 'PR-DEF')
            RETURNING quadrantes_leuco, quadrantes_hema, paciente
            """
        )
    ).one()
    db_session.commit()
    assert float(row.quadrantes_leuco) == 4
    assert float(row.quadrantes_hema) == 1
    assert row.paciente is None

    indices = {
        r[0]
        for r in db_session.execute(
            text("SELECT name FROM sqlite_master WHERE type = 'index'")
        )
    }
    assert "idx_exames_prontuario" in indices
    assert "idx_exames_data" in indices


def test_not_null_operador_prontuario(db_session):
    with pytest.raises(IntegrityError):
        db_session.execute(
            text(
                "INSERT INTO exames (data_exame, prontuario) VALUES ('2026-01-01', 'PR-X')"
            )
        )
        db_session.commit()
    db_session.rollback()

    with pytest.raises(IntegrityError):
        db_session.execute(
            text(
                "INSERT INTO exames (data_exame, operador) VALUES ('2026-01-01', 'Ana')"
            )
        )
        db_session.commit()
    db_session.rollback()


def test_paciente_nullable(db_session):
    db_session.execute(
        text(
            """
            INSERT INTO exames (data_exame, operador, prontuario, paciente)
            VALUES ('2026-01-01', 'Ana', 'PR-N', NULL)
            """
        )
    )
    db_session.commit()
    n = db_session.execute(text("SELECT COUNT(*) FROM exames")).scalar()
    assert n == 1
