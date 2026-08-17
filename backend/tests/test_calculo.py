import pytest

from app.calculo import celulas_por_ul, percentual


def test_casos_ouro_celulas(formula_casos):
    for caso in formula_casos["celulas"]:
        obtido = celulas_por_ul(caso["total"], caso["diluicao"], caso["quadrantes"])
        assert obtido == pytest.approx(caso["esperado"]), caso["id"]


def test_casos_ouro_percentual(formula_casos):
    for caso in formula_casos["percentual"]:
        obtido = percentual(caso["parte"], caso["total"])
        assert obtido == pytest.approx(caso["esperado"]), caso["id"]


def test_borda_total_negativo_ainda_calcula_se_params_ok():
    # A função pura não valida sinal do total; a API/schema impede negativo.
    assert celulas_por_ul(-4, 1, 4) == -10.0
