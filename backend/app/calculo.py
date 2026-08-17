# Cálculo de células/µL e percentual do diferencial
# Fórmula: total ÷ (quadrantes × 0,1) × diluição  (= total × diluição × 10 / quadrantes)


def celulas_por_ul(total: int, diluicao: float, quadrantes: float) -> float:
    if diluicao <= 0 or quadrantes <= 0:
        return 0.0
    return (total * diluicao * 10) / quadrantes


def percentual(parte: int, total: int) -> float:
    if not total:
        return 0.0
    return (parte * 100) / total


def aplicar_calculo(dados: dict) -> dict:
    # Recalcula céls/µL e percentuais; ignora *_ul / *_pct enviados pelo cliente
    out = dict(dados)
    out["leucocitos_ul"] = round(
        celulas_por_ul(
            out["leucocitos"], out["diluicao_leuco"], out["quadrantes_leuco"]
        ),
        2,
    )
    out["hemacias_ul"] = round(
        celulas_por_ul(out["hemacias"], out["diluicao_hema"], out["quadrantes_hema"]),
        2,
    )
    total_diff = out["poli"] + out["mono"]
    out["poli_pct"] = round(percentual(out["poli"], total_diff), 2)
    out["mono_pct"] = round(percentual(out["mono"], total_diff), 2)
    return out
