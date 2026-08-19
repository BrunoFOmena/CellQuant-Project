// Aba Consulta — tabela, filtros, paginação e baixar CSV (sem Google Sheets)
import { useEffect, useMemo, useState } from "react";
import { listarExames } from "../api/exames";
import type { Exame } from "../types/exame";
import { baixarCsv } from "../utils/csv";
import { formatarNumero } from "../utils/calculo";
import { useApp } from "../context/AppContext";

const PAGE_SIZE = 5;

export function Consulta() {
  const { secao } = useApp();
  const [exames, setExames] = useState<Exame[]>([]);
  const [q, setQ] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState<Exame | null>(null);
  const [erro, setErro] = useState("");

  async function carregar() {
    setErro("");
    try {
      const dados = await listarExames({
        q: q || undefined,
        data_inicial: dataInicial || undefined,
        data_final: dataFinal || undefined,
      });
      setExames(dados);
      setPagina(1);
    } catch {
      setExames([]);
      setSelecionado(null);
      setErro(
        "API indisponível. Nenhum exame listado. Verifique se o backend está rodando."
      );
      setPagina(1);
    }
  }

  useEffect(() => {
    if (secao === "tabela") carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secao]);

  // Fatia da página atual
  const totalPaginas = Math.max(1, Math.ceil(exames.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginaItens = useMemo(() => {
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    return exames.slice(inicio, inicio + PAGE_SIZE);
  }, [exames, paginaAtual]);

  const inicioRegistro =
    exames.length === 0 ? 0 : (paginaAtual - 1) * PAGE_SIZE + 1;
  const fimRegistro = Math.min(paginaAtual * PAGE_SIZE, exames.length);

  // Navega no detalhe entre exames da lista filtrada
  function irDetalhe(delta: number) {
    if (!selecionado) return;
    const idx = exames.findIndex((e) => e.id === selecionado.id);
    const novo = exames[idx + delta];
    if (novo) setSelecionado(novo);
  }

  return (
    <section>
      <div className="consulta-topo">
        <button
          type="button"
          className="btn btn-verde"
          onClick={() => baixarCsv(exames)}
          disabled={exames.length === 0}
        >
          Baixar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3>Filtros</h3>
        <div className="filtros-grid">
          <label className="span-2">
            Buscar (prontuário, operador, paciente, data ou observações)
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Digite para filtrar..."
            />
          </label>
          <label>
            Data inicial
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
          </label>
          <label>
            Data final
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </label>
          <div className="filtros-acoes">
            <button type="button" className="btn btn-azul" onClick={carregar}>
              Aplicar
            </button>
            <button
              type="button"
              className="btn btn-cinza"
              onClick={async () => {
                setQ("");
                setDataInicial("");
                setDataFinal("");
                setErro("");
                try {
                  const dados = await listarExames({});
                  setExames(dados);
                } catch {
                  setExames([]);
                  setSelecionado(null);
                  setErro(
                    "API indisponível. Nenhum exame listado. Verifique se o backend está rodando."
                  );
                }
                setPagina(1);
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {erro && <div className="alerta-vermelho">{erro}</div>}

      {/* Tabela */}
      <div className="card">
        <h3>Exames salvos</h3>
        {exames.length === 0 ? (
          <p>
            {erro
              ? "Não foi possível carregar os exames."
              : "Nenhum exame salvo ainda. Faça uma contagem e salve no Laudo."}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="tabela-cartoes">
              <thead>
                <tr>
                  <th>data</th>
                  <th>operador</th>
                  <th>prontuario</th>
                  <th>paciente</th>
                  <th>leucocitos_uL</th>
                  <th>hemacias_uL</th>
                  <th>poli_pct</th>
                  <th>mono_pct</th>
                  <th>observacoes</th>
                </tr>
              </thead>
              <tbody>
                {paginaItens.map((e) => (
                  <tr
                    key={e.id}
                    className={selecionado?.id === e.id ? "selecionada" : ""}
                    onClick={() => setSelecionado(e)}
                  >
                    <td data-label="Data">
                      {e.data_exame.split("-").reverse().join("/")}
                    </td>
                    <td data-label="Operador">{e.operador}</td>
                    <td data-label="Prontuário">{e.prontuario}</td>
                    <td data-label="Paciente">{e.paciente || "—"}</td>
                    <td data-label="Leucócitos/µL">
                      {formatarNumero(Number(e.leucocitos_ul), 0)}
                    </td>
                    <td data-label="Hemácias/µL">
                      {formatarNumero(Number(e.hemacias_ul), 0)}
                    </td>
                    <td data-label="Poli %">
                      {formatarNumero(Number(e.poli_pct), 0)}%
                    </td>
                    <td data-label="Mono %">
                      {formatarNumero(Number(e.mono_pct), 0)}%
                    </td>
                    <td className="obs-cell" data-label="Observações">
                      {e.observacoes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="paginacao">
          <span>
            Mostrando {inicioRegistro}–{fimRegistro} de {exames.length} registros
          </span>
          <div className="acoes">
            <button
              type="button"
              className="btn btn-cinza"
              disabled={paginaAtual <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              ← Anterior
            </button>
            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              type="button"
              className="btn btn-cinza"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>

      {/* Detalhe do exame selecionado */}
      {selecionado && (
        <div className="card detalhe">
          <h3>Detalhe do exame</h3>
          <p>
            <strong>{selecionado.prontuario}</strong> — {selecionado.operador} —{" "}
            {selecionado.data_exame.split("-").reverse().join("/")}
          </p>
          <p>Paciente: {selecionado.paciente || "Não informado"}</p>
          <p>
            Leucócitos: {selecionado.leucocitos_ul} /µL | Hemácias:{" "}
            {selecionado.hemacias_ul} /µL
          </p>
          <p>
            Diferencial: poli {selecionado.poli_pct}% | mono {selecionado.mono_pct}%
          </p>
          <p>Observações: {selecionado.observacoes || "—"}</p>
          <div className="acoes">
            <button
              type="button"
              className="btn btn-cinza"
              onClick={() => irDetalhe(-1)}
            >
              ← Registro anterior
            </button>
            <button
              type="button"
              className="btn btn-cinza"
              onClick={() => irDetalhe(1)}
            >
              Próximo registro →
            </button>
            <button
              type="button"
              className="btn btn-azul"
              onClick={() => setSelecionado(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
