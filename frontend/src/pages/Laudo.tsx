// Aba Laudo — resumo e salvar no backend
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { criarExame, listarExames } from "../api/exames";
import { formatarNumero } from "../utils/calculo";

export function Laudo() {
  const {
    registro,
    contagem,
    resultados,
    registroCompleto,
    limparTudo,
    setAba,
  } = useApp();
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const temContagem =
    contagem.leuco > 0 ||
    contagem.hema > 0 ||
    contagem.poli > 0 ||
    contagem.mono > 0;

  async function jaExisteMesmoProntuarioData(): Promise<boolean> {
    const prontuario = registro.prontuario.trim();
    try {
      const existentes = await listarExames({ q: prontuario });
      return existentes.some(
        (e) =>
          e.prontuario.trim().toLowerCase() === prontuario.toLowerCase() &&
          e.data_exame === registro.data_exame
      );
    } catch {
      return false;
    }
  }

  async function salvar() {
    setErro("");
    if (!registroCompleto) {
      setErro("Preencha Operador e Prontuário na aba Registro.");
      return;
    }
    if (!temContagem) {
      setErro("Nenhuma contagem registrada. Volte à aba Contador CEL.");
      return;
    }
    if (registro.quadrantes_leuco < 1 || registro.quadrantes_hema < 1) {
      setErro("Quadrantes devem ser pelo menos 1.");
      return;
    }
    if (registro.diluicao_leuco <= 0 || registro.diluicao_hema <= 0) {
      setErro("Diluição deve ser maior que zero.");
      return;
    }

    if (await jaExisteMesmoProntuarioData()) {
      const ok = window.confirm(
        `Já existe exame com prontuário ${registro.prontuario.trim()} na data ${registro.data_exame.split("-").reverse().join("/")}. Salvar mesmo assim?`
      );
      if (!ok) return;
    }

    setSalvando(true);
    try {
      await criarExame({
        data_exame: registro.data_exame,
        operador: registro.operador.trim(),
        prontuario: registro.prontuario.trim(),
        paciente: registro.paciente.trim() || null,
        quadrantes_leuco: registro.quadrantes_leuco,
        diluicao_leuco: registro.diluicao_leuco,
        leucocitos: contagem.leuco,
        leucocitos_ul: Number(resultados.leucoUl.toFixed(2)),
        quadrantes_hema: registro.quadrantes_hema,
        diluicao_hema: registro.diluicao_hema,
        hemacias: contagem.hema,
        hemacias_ul: Number(resultados.hemaUl.toFixed(2)),
        poli: contagem.poli,
        mono: contagem.mono,
        poli_pct: Number(resultados.poliPct.toFixed(2)),
        mono_pct: Number(resultados.monoPct.toFixed(2)),
        observacoes: registro.observacoes.trim() || null,
      });
      limparTudo();
      setAba("consulta");
    } catch {
      setErro(
        "Não foi possível salvar. Verifique se o backend e o Postgres estão rodando."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      {!temContagem && (
        <div className="alerta-vermelho">
          Nenhuma contagem registrada. Volte à aba Contador CEL. antes de salvar.
        </div>
      )}

      <div className="laudo-grid">
        <div className="card">
          <h3>IDENTIFICAÇÃO</h3>
          <p>
            <span>Operador</span>
            <strong>{registro.operador || "—"}</strong>
          </p>
          <p>
            <span>Prontuário</span>
            <strong>{registro.prontuario || "—"}</strong>
          </p>
          <p>
            <span>Paciente</span>
            <strong>{registro.paciente || "—"}</strong>
          </p>
          <p>
            <span>Data do exame</span>
            <strong>
              {registro.data_exame.split("-").reverse().join("/")}
            </strong>
          </p>
        </div>

        <div className="card">
          <h3>CELULARIDADE</h3>
          <p>
            <span>Leucócitos</span>
            <strong>{formatarNumero(resultados.leucoUl, 0)} céls/µL</strong>
          </p>
          <p>
            <span>Hemácias</span>
            <strong>{formatarNumero(resultados.hemaUl, 0)} céls/µL</strong>
          </p>
          <p>
            <span>Total leucócitos contados</span>
            <strong>{contagem.leuco}</strong>
          </p>
          <p>
            <span>Total hemácias contadas</span>
            <strong>{contagem.hema}</strong>
          </p>
        </div>

        <div className="card">
          <h3>DIFERENCIAL</h3>
          <p>
            <span>Polimorfonucleares</span>
            <strong>
              {contagem.poli} ({formatarNumero(resultados.poliPct, 0)}%)
            </strong>
          </p>
          <p>
            <span>Mononucleares</span>
            <strong>
              {contagem.mono} ({formatarNumero(resultados.monoPct, 0)}%)
            </strong>
          </p>
          <p>
            <span>Total diferencial</span>
            <strong>{resultados.totalDiff}</strong>
          </p>
        </div>

        <div className="card">
          <h3>OBSERVAÇÕES</h3>
          <p>{registro.observacoes.trim() || "Sem observações."}</p>
        </div>
      </div>

      {erro && <div className="alerta-vermelho">{erro}</div>}

      <div className="acoes">
        <button
          type="button"
          className="btn btn-verde"
          disabled={salvando}
          onClick={salvar}
        >
          {salvando ? "Salvando..." : "Salvar registro"}
        </button>
        <button
          type="button"
          className="btn btn-cinza"
          onClick={() => {
            if (window.confirm("Limpar contagem e registro atuais da tela?")) {
              limparTudo();
              setAba("registro");
            }
          }}
        >
          Limpar contagem atual
        </button>
      </div>
    </section>
  );
}
