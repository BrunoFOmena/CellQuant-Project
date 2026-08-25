// Shell: módulos na lateral; fluxo do contador no topo
import { useState, type ReactNode, type SVGProps } from "react";
import type { Aba, Secao } from "../types/exame";
import { useApp } from "../context/AppContext";

const ABAS_TOPO: { id: Aba; label: string; titulo: string; resumo: string }[] = [
  {
    id: "registro",
    label: "Registro",
    titulo: "Registro do exame",
    resumo: "Identificação do paciente e parâmetros da câmara",
  },
  {
    id: "contador",
    label: "Contador celular",
    titulo: "Contador celular",
    resumo: "Leucócitos, hemácias e diferencial",
  },
  {
    id: "laudo",
    label: "Laudo",
    titulo: "Laudo",
    resumo: "Revisão dos resultados e gravação",
  },
  {
    id: "metodologia",
    label: "Metodologia",
    titulo: "Metodologia",
    resumo: "Passos da contagem em câmara de Neubauer",
  },
  {
    id: "significado",
    label: "Significado clínico",
    titulo: "Significado clínico",
    resumo: "Interpretação dos achados no LCR",
  },
];

const SECOES: {
  id: Secao;
  label: string;
  titulo: string;
  resumo: string;
}[] = [
  {
    id: "contador",
    label: "Acesso ao contador",
    titulo: "Acesso ao contador",
    resumo: "Registro, contagem, laudo e material de apoio",
  },
  {
    id: "manual",
    label: "Adicionar manualmente",
    titulo: "Entrada manual",
    resumo: "Lançar exame a partir da anotação em papel",
  },
  {
    id: "tabela",
    label: "Acesso à tabela",
    titulo: "Consulta de exames",
    resumo: "Histórico, filtros e exportação CSV",
  },
  {
    id: "estatistica",
    label: "Estatística dos dados",
    titulo: "Estatística dos dados",
    resumo: "Resumo dos exames gravados",
  },
];

const svgProps: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function IconeSecao({ id }: { id: Secao }) {
  if (id === "contador") {
    return (
      <svg {...svgProps}>
        <circle cx="8" cy="8" r="2" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="8" cy="16" r="2" />
        <circle cx="16" cy="16" r="2" />
      </svg>
    );
  }
  if (id === "manual") {
    return (
      <svg {...svgProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }
  if (id === "tabela") {
    return (
      <svg {...svgProps}>
        <path d="M4 5h16v14H4z" />
        <path d="M4 10h16M4 15h16M10 5v14" />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { aba, setAba, secao, setSecao } = useApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const secaoAtual = SECOES.find((item) => item.id === secao) ?? SECOES[0];
  const abaAtual = ABAS_TOPO.find((item) => item.id === aba);
  const noContador = secao === "contador";
  const titulo = noContador ? (abaAtual?.titulo ?? secaoAtual.titulo) : secaoAtual.titulo;
  const resumo = noContador ? (abaAtual?.resumo ?? secaoAtual.resumo) : secaoAtual.resumo;
  const passoAtual = Math.max(1, ABAS_TOPO.findIndex((item) => item.id === aba) + 1);

  function irSecao(id: Secao) {
    setSecao(id);
    setMenuAberto(false);
  }

  function irAba(id: Aba) {
    setAba(id);
    setMenuAberto(false);
  }

  return (
    <div className={menuAberto ? "app-shell menu-aberto" : "app-shell"}>
      <aside className="menu-lateral">
        <div className="menu-marca">
          <img
            className="menu-logo"
            src="/logo.png"
            alt="CellQuant"
            width={180}
          />
        </div>

        <nav aria-label="Seções">
          {SECOES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={secao === item.id ? "menu-item ativo" : "menu-item"}
              aria-current={secao === item.id ? "page" : undefined}
              onClick={() => irSecao(item.id)}
            >
              <IconeSecao id={item.id} />
              <span className="menu-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <p className="menu-autoria">
          <span>Bruno Omena</span>
          <span aria-hidden="true"> · </span>
          <span>José Marcos</span>
        </p>
      </aside>

      {menuAberto ? (
        <button
          type="button"
          className="menu-fundo"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      ) : null}

      <div className={noContador && aba === "contador" ? "app-principal tela-contador" : "app-principal"}>
        <header className="topo-pagina">
          <button
            type="button"
            className="btn-menu"
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(true)}
          >
            ☰
          </button>
          <div>
            <h1>{titulo}</h1>
            <p className="subtitulo-pagina">{resumo}</p>
          </div>
        </header>

        {noContador ? (
          <div className="faixa-passos">
            <p className="passos-compacto">
              {passoAtual} de {ABAS_TOPO.length} · {abaAtual?.label}
            </p>
            <div className="passos-pilulas" role="navigation" aria-label="Fluxo do exame">
              {ABAS_TOPO.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={aba === item.id ? "passo ativo" : "passo"}
                  aria-current={aba === item.id ? "step" : undefined}
                  onClick={() => irAba(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <main className="conteudo">
          <div key={`${secao}-${aba}`} className="pagina-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
