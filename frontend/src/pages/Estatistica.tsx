// Resumo estatístico dos exames gravados
import { useEffect, useMemo, useState } from "react";
import { listarExames } from "../api/exames";
import type { Exame } from "../types/exame";
import { formatarNumero } from "../utils/calculo";

export function Estatistica() {
  const [exames, setExames] = useState<Exame[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    async function carregar() {
      setErro("");
      setCarregando(true);
      try {
        const dados = await listarExames();
        if (vivo) setExames(dados);
      } catch {
        if (vivo) {
          setExames([]);
          setErro(
            "API indisponível. Nenhum exame listado. Verifique se o backend está rodando."
          );
        }
      } finally {
        if (vivo) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      vivo = false;
    };
  }, []);

  const resumo = useMemo(() => {
    const n = exames.length;
    if (n === 0) {
      return {
        total: 0,
        mediaLeuco: 0,
        mediaHema: 0,
        poliPred: 0,
        monoPred: 0,
        empate: 0,
        dataInicial: "",
        dataFinal: "",
      };
    }
    const somaLeuco = exames.reduce((acc, e) => acc + Number(e.leucocitos_ul), 0);
    const somaHema = exames.reduce((acc, e) => acc + Number(e.hemacias_ul), 0);
    let poliPred = 0;
    let monoPred = 0;
    let empate = 0;
    for (const e of exames) {
      const poli = Number(e.poli_pct);
      const mono = Number(e.mono_pct);
      if (poli > mono) poliPred += 1;
      else if (mono > poli) monoPred += 1;
      else empate += 1;
    }
    const datas = exames.map((e) => e.data_exame).sort();
    return {
      total: n,
      mediaLeuco: somaLeuco / n,
      mediaHema: somaHema / n,
      poliPred,
      monoPred,
      empate,
      dataInicial: datas[0].split("-").reverse().join("/"),
      dataFinal: datas[datas.length - 1].split("-").reverse().join("/"),
    };
  }, [exames]);

  return (
    <section>
      {erro ? <div className="alerta-vermelho">{erro}</div> : null}
      {carregando ? <p className="hint">Carregando estatísticas…</p> : null}

      {!carregando && resumo.total === 0 && !erro ? (
        <div className="card">
          <p>Nenhum exame salvo ainda. Grave um laudo para ver as estatísticas.</p>
        </div>
      ) : null}

      {resumo.total > 0 ? (
        <>
          <div className="estats-grid">
            <div className="card estat-card">
              <span>Exames gravados</span>
              <strong>{formatarNumero(resumo.total, 0)}</strong>
            </div>
            <div className="card estat-card">
              <span>Média de leucócitos</span>
              <strong>{formatarNumero(resumo.mediaLeuco, 0)} /µL</strong>
            </div>
            <div className="card estat-card">
              <span>Média de hemácias</span>
              <strong>{formatarNumero(resumo.mediaHema, 0)} /µL</strong>
            </div>
            <div className="card estat-card">
              <span>Predomínio de poli</span>
              <strong>
                {formatarNumero(resumo.poliPred, 0)} ({formatarNumero((resumo.poliPred * 100) / resumo.total, 0)}%)
              </strong>
            </div>
            <div className="card estat-card">
              <span>Predomínio de mono</span>
              <strong>
                {formatarNumero(resumo.monoPred, 0)} ({formatarNumero((resumo.monoPred * 100) / resumo.total, 0)}%)
              </strong>
            </div>
            <div className="card estat-card">
              <span>Período</span>
              <strong>
                {resumo.dataInicial} — {resumo.dataFinal}
              </strong>
            </div>
          </div>
          <p className="hint">
            Empate no diferencial: {formatarNumero(resumo.empate, 0)} exame(s). Valores calculados sobre todos os
            registros gravados, sem filtro.
          </p>
        </>
      ) : null}
    </section>
  );
}
