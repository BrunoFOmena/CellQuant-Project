// Aba Contador — teclas 1–6 e botões de contagem (tudo numa tela)
import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { formatarNumero } from "../utils/calculo";

export function Contador() {
  const {
    registro,
    setRegistro,
    contagem,
    incrementar,
    desfazer,
    zerarContagem,
    resultados,
    setAba,
  } = useApp();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "1") {
        e.preventDefault();
        incrementar("L");
      } else if (e.key === "2") {
        e.preventDefault();
        incrementar("E");
      } else if (e.key === "3") {
        e.preventDefault();
        incrementar("N");
      } else if (e.key === "4") {
        e.preventDefault();
        incrementar("M");
      } else if (e.key === "5") {
        e.preventDefault();
        desfazer();
      } else if (e.key === "6") {
        e.preventDefault();
        if (window.confirm("Zerar toda a contagem atual?")) zerarContagem();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [incrementar, desfazer, zerarContagem]);

  return (
    <section className="pagina-contador">
      <div className="alerta-vermelho alerta-compacto">
        Atenção: verifique se a amostra está homogênea na câmara
      </div>

      <div className="contador-mesa">
        <div className="card">
          <h3>Leucócitos</h3>
          <div className="campos-duplos">
            <label>
              Quadrantes
              <input
                type="number"
                min={1}
                value={registro.quadrantes_leuco}
                onChange={(e) =>
                  setRegistro((r) => ({
                    ...r,
                    quadrantes_leuco: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>
            <label>
              Diluição
              <input
                type="number"
                min={0.1}
                step="any"
                value={registro.diluicao_leuco}
                onChange={(e) =>
                  setRegistro((r) => ({
                    ...r,
                    diluicao_leuco: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>
          </div>
          <div className="total-box">
            <span>Total contado</span>
            <strong>{contagem.leuco}</strong>
          </div>
          <div className="resultado-box">
            Resultado {formatarNumero(resultados.leucoUl, 0)} céls/µL
          </div>
          <button
            type="button"
            className="btn btn-amarelo btn-largo"
            onClick={() => incrementar("L")}
          >
            Contar leucócitos (tecla 1)
          </button>
        </div>

        <div className="card">
          <h3>Hemácias</h3>
          <div className="campos-duplos">
            <label>
              Quadrantes
              <input
                type="number"
                min={1}
                value={registro.quadrantes_hema}
                onChange={(e) =>
                  setRegistro((r) => ({
                    ...r,
                    quadrantes_hema: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>
            <label>
              Diluição
              <input
                type="number"
                min={0.1}
                step="any"
                value={registro.diluicao_hema}
                onChange={(e) =>
                  setRegistro((r) => ({
                    ...r,
                    diluicao_hema: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>
          </div>
          <p className="hint">Padrão: 1 quadrante (retículo central)</p>
          <div className="total-box">
            <span>Total contado</span>
            <strong>{contagem.hema}</strong>
          </div>
          <div className="resultado-box">
            Resultado {formatarNumero(resultados.hemaUl, 0)} céls/µL
          </div>
          <button
            type="button"
            className="btn btn-amarelo btn-largo"
            onClick={() => incrementar("E")}
          >
            Contar hemácias (tecla 2)
          </button>
        </div>

        <div className="card">
          <h3>Diferencial</h3>
          <div className="diff-grid diff-grid-vertical">
            <div className="diff-card">
              <span>Polimorfonucleares</span>
              <strong>
                {contagem.poli} ({formatarNumero(resultados.poliPct, 0)}%)
              </strong>
              <button
                type="button"
                className="btn btn-amarelo btn-largo"
                onClick={() => incrementar("N")}
              >
                Contar (tecla 3)
              </button>
            </div>
            <div className="diff-card">
              <span>Mononucleares</span>
              <strong>
                {contagem.mono} ({formatarNumero(resultados.monoPct, 0)}%)
              </strong>
              <button
                type="button"
                className="btn btn-amarelo btn-largo"
                onClick={() => incrementar("M")}
              >
                Contar (tecla 4)
              </button>
            </div>
          </div>
          <p className="hint">
            Total diferencial: {resultados.totalDiff} (percentuais sobre este total)
          </p>
        </div>
      </div>

      <div className="contador-base">
        <div className="card card-obs">
          <h3>Observações</h3>
          <textarea
            rows={2}
            value={registro.observacoes}
            onChange={(e) =>
              setRegistro((r) => ({ ...r, observacoes: e.target.value }))
            }
            placeholder="Ex.: aspecto, diluição especial, contagem em duplicata..."
          />
        </div>
        <div className="card card-acoes-contador">
          <p className="legenda">
            Teclas: 1 leucócito · 2 hemácia · 3 poli · 4 mono · 5 desfazer · 6 zerar
          </p>
          <p className="caixa-formula caixa-formula-compacta">
            células/µL = total ÷ (quadrantes × 0,1) × diluição
          </p>
          <div className="acoes acoes-contador">
            <button
              type="button"
              className="btn btn-vermelho"
              onClick={() => {
                if (window.confirm("Zerar toda a contagem atual?")) zerarContagem();
              }}
            >
              Zerar contagem
            </button>
            <button type="button" className="btn btn-cinza" onClick={desfazer}>
              Desfazer última (5)
            </button>
            <button
              type="button"
              className="btn btn-azul"
              onClick={() => setAba("laudo")}
            >
              Ir para Laudo →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
