// Entrada manual — lançar exame a partir de anotação em papel (sem o contador)
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { criarExame, listarExames } from "../api/exames";
import { CampoData } from "../components/CampoData";
import { celulasPorUL, formatarNumero, percentual } from "../utils/calculo";
import { dataCivilLocal, formatarDataBr } from "../utils/data";

type Formulario = {
  operador: string;
  prontuario: string;
  paciente: string;
  data_exame: string;
  quadrantes_leuco: number;
  diluicao_leuco: number;
  leucocitos: number;
  quadrantes_hema: number;
  diluicao_hema: number;
  hemacias: number;
  poli: number;
  mono: number;
  observacoes: string;
};

const vazio: Formulario = {
  operador: "",
  prontuario: "",
  paciente: "",
  data_exame: dataCivilLocal(),
  quadrantes_leuco: 4,
  diluicao_leuco: 1,
  leucocitos: 0,
  quadrantes_hema: 1,
  diluicao_hema: 1,
  hemacias: 0,
  poli: 0,
  mono: 0,
  observacoes: "",
};

function inteiro(valor: string): number {
  const n = Number(valor);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.trunc(n);
}

function positivo(valor: string, minimo: number): number {
  const n = Number(valor);
  if (!Number.isFinite(n)) return minimo;
  return n;
}

export function Manual() {
  const { setSecao } = useApp();
  const [form, setForm] = useState<Formulario>(vazio);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const completo =
    form.operador.trim() !== "" && form.prontuario.trim() !== "";

  const resultados = useMemo(() => {
    const totalDiff = form.poli + form.mono;
    return {
      leucoUl: celulasPorUL(
        form.leucocitos,
        form.diluicao_leuco,
        form.quadrantes_leuco
      ),
      hemaUl: celulasPorUL(
        form.hemacias,
        form.diluicao_hema,
        form.quadrantes_hema
      ),
      totalDiff,
      poliPct: percentual(form.poli, totalDiff),
      monoPct: percentual(form.mono, totalDiff),
    };
  }, [form]);

  const temContagem =
    form.leucocitos > 0 ||
    form.hemacias > 0 ||
    form.poli > 0 ||
    form.mono > 0;

  async function jaExisteMesmoProntuarioData(): Promise<boolean> {
    const prontuario = form.prontuario.trim();
    try {
      const existentes = await listarExames({ q: prontuario });
      return existentes.some(
        (e) =>
          e.prontuario.trim().toLowerCase() === prontuario.toLowerCase() &&
          e.data_exame === form.data_exame
      );
    } catch {
      return false;
    }
  }

  async function salvar() {
    setErro("");
    if (!completo) {
      setErro("Preencha Operador e Prontuário.");
      return;
    }
    if (!temContagem) {
      setErro("Informe ao menos um total contado (leucócitos, hemácias ou diferencial).");
      return;
    }
    if (form.quadrantes_leuco < 1 || form.quadrantes_hema < 1) {
      setErro("Quadrantes devem ser pelo menos 1.");
      return;
    }
    if (form.diluicao_leuco <= 0 || form.diluicao_hema <= 0) {
      setErro("Diluição deve ser maior que zero.");
      return;
    }

    if (await jaExisteMesmoProntuarioData()) {
      const ok = window.confirm(
        `Já existe exame com prontuário ${form.prontuario.trim()} na data ${formatarDataBr(form.data_exame)}. Salvar mesmo assim?`
      );
      if (!ok) return;
    }

    setSalvando(true);
    try {
      await criarExame({
        data_exame: form.data_exame,
        operador: form.operador.trim(),
        prontuario: form.prontuario.trim(),
        paciente: form.paciente.trim() || null,
        quadrantes_leuco: form.quadrantes_leuco,
        diluicao_leuco: form.diluicao_leuco,
        leucocitos: form.leucocitos,
        leucocitos_ul: Number(resultados.leucoUl.toFixed(2)),
        quadrantes_hema: form.quadrantes_hema,
        diluicao_hema: form.diluicao_hema,
        hemacias: form.hemacias,
        hemacias_ul: Number(resultados.hemaUl.toFixed(2)),
        poli: form.poli,
        mono: form.mono,
        poli_pct: Number(resultados.poliPct.toFixed(2)),
        mono_pct: Number(resultados.monoPct.toFixed(2)),
        observacoes: form.observacoes.trim() || null,
      });
      setForm({ ...vazio, data_exame: dataCivilLocal() });
      setSecao("tabela");
    } catch {
      setErro("Não foi possível salvar. Verifique se o backend está rodando.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section>
      <div className="alerta-amarelo">
        Use esta tela quando a contagem já estiver no papel. Informe os totais
        da câmara; o sistema calcula céls/µL com a mesma fórmula do contador.
      </div>

      <div className="card">
        <h2>Identificação</h2>
        <div className="form-grid">
          <label>
            Operador*
            <input
              value={form.operador}
              onChange={(e) =>
                setForm((f) => ({ ...f, operador: e.target.value }))
              }
              placeholder="Nome do técnico / biomédico"
            />
          </label>
          <label>
            Prontuário*
            <input
              value={form.prontuario}
              onChange={(e) =>
                setForm((f) => ({ ...f, prontuario: e.target.value }))
              }
              placeholder="Ex.: PR-100234"
            />
          </label>
          <label>
            Paciente (opcional)
            <input
              value={form.paciente}
              onChange={(e) =>
                setForm((f) => ({ ...f, paciente: e.target.value }))
              }
              placeholder="Nome do paciente"
            />
          </label>
          <label>
            Data do exame
            <CampoData
              value={form.data_exame}
              onChange={(iso) => setForm((f) => ({ ...f, data_exame: iso }))}
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Leucócitos</h2>
        <div className="form-grid">
          <label>
            Total de leucócitos
            <input
              type="number"
              min={0}
              value={form.leucocitos}
              onChange={(e) =>
                setForm((f) => ({ ...f, leucocitos: inteiro(e.target.value) }))
              }
            />
          </label>
          <label>
            Quadrantes
            <input
              type="number"
              min={1}
              step="any"
              value={form.quadrantes_leuco}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  quadrantes_leuco: positivo(e.target.value, 1),
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
              value={form.diluicao_leuco}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  diluicao_leuco: positivo(e.target.value, 1),
                }))
              }
            />
          </label>
        </div>
        <div className="resultado-box">
          Resultado {formatarNumero(resultados.leucoUl, 0)} céls/µL
        </div>
      </div>

      <div className="card">
        <h2>Hemácias</h2>
        <div className="form-grid">
          <label>
            Total de hemácias
            <input
              type="number"
              min={0}
              value={form.hemacias}
              onChange={(e) =>
                setForm((f) => ({ ...f, hemacias: inteiro(e.target.value) }))
              }
            />
          </label>
          <label>
            Quadrantes
            <input
              type="number"
              min={1}
              step="any"
              value={form.quadrantes_hema}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  quadrantes_hema: positivo(e.target.value, 1),
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
              value={form.diluicao_hema}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  diluicao_hema: positivo(e.target.value, 1),
                }))
              }
            />
          </label>
        </div>
        <div className="resultado-box">
          Resultado {formatarNumero(resultados.hemaUl, 0)} céls/µL
        </div>
      </div>

      <div className="card">
        <h2>Diferencial</h2>
        <div className="form-grid">
          <label>
            Polimorfonucleares
            <input
              type="number"
              min={0}
              value={form.poli}
              onChange={(e) =>
                setForm((f) => ({ ...f, poli: inteiro(e.target.value) }))
              }
            />
          </label>
          <label>
            Mononucleares
            <input
              type="number"
              min={0}
              value={form.mono}
              onChange={(e) =>
                setForm((f) => ({ ...f, mono: inteiro(e.target.value) }))
              }
            />
          </label>
        </div>
        <p className="hint">
          {formatarNumero(resultados.poliPct, 0)}% poli ·{" "}
          {formatarNumero(resultados.monoPct, 0)}% mono · total{" "}
          {resultados.totalDiff}
        </p>
      </div>

      <div className="card">
        <h2>Observações</h2>
        <textarea
          rows={3}
          value={form.observacoes}
          onChange={(e) =>
            setForm((f) => ({ ...f, observacoes: e.target.value }))
          }
          placeholder="Ex.: lançado do papel, aspecto da amostra..."
        />
      </div>

      {!completo && (
        <div className="alerta-vermelho">
          Preencha os campos obrigatórios: Operador e Prontuário
        </div>
      )}
      {erro && <div className="alerta-vermelho">{erro}</div>}

      <div className="acoes">
        <button
          type="button"
          className="btn btn-verde"
          disabled={salvando}
          onClick={() => void salvar()}
        >
          {salvando ? "Salvando..." : "Salvar registro"}
        </button>
        <button
          type="button"
          className="btn btn-cinza"
          onClick={() => {
            if (window.confirm("Limpar o formulário atual?")) {
              setForm({ ...vazio, data_exame: dataCivilLocal() });
              setErro("");
            }
          }}
        >
          Limpar
        </button>
      </div>
    </section>
  );
}
