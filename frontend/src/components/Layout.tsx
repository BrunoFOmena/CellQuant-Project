// Layout: cabeçalho, abas e faixa de passos
import type { Aba } from "../types/exame";
import { useApp } from "../context/AppContext";

const ABAS: { id: Aba; label: string }[] = [
  { id: "registro", label: "REGISTRO" },
  { id: "contador", label: "CONTADOR CEL." },
  { id: "laudo", label: "LAUDO" },
  { id: "consulta", label: "CONSULTA" },
  { id: "metodologia", label: "METODOLOGIA" },
  { id: "significado", label: "SIGNIFICADO CLÍNICO" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { aba, setAba } = useApp();

  return (
    <div className="app-shell">
      {/* Cabeçalho do app */}
      <header className="topo">
        <div>
          <strong>CONTADOR LCR</strong>
          <span className="subtitulo-topo">
            Contagem celular de líquido cefalorraquidiano — laboratório clínico
          </span>
        </div>
      </header>

      {/* Navegação por abas */}
      <nav className="abas">
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={aba === item.id ? "aba ativa" : "aba"}
            onClick={() => setAba(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Guia de fluxo */}
      <div className="faixa-passos">
        Agora: 1) Preencha o Registro → 2) Conte → 3) Salve no Laudo → 4) Consulte o
        histórico
      </div>

      <main className="conteudo">{children}</main>
    </div>
  );
}
