// Shell de uma página: menu lateral + área da seção ativa
import { useState, type ReactNode, type SVGProps } from "react";
import type { Aba } from "../types/exame";
import { useApp } from "../context/AppContext";

const FLUXO: Aba[] = ["registro", "contador", "laudo", "consulta"];

const ABAS: {
  id: Aba;
  label: string;
  titulo: string;
  resumo: string;
  grupo: "exame" | "referencia";
}[] = [
  {
    id: "registro",
    label: "Registro",
    titulo: "Registro do exame",
    resumo: "Identificação do paciente e parâmetros da câmara",
    grupo: "exame",
  },
  {
    id: "contador",
    label: "Contador celular",
    titulo: "Contador celular",
    resumo: "Leucócitos, hemácias e diferencial",
    grupo: "exame",
  },
  {
    id: "laudo",
    label: "Laudo",
    titulo: "Laudo",
    resumo: "Revisão dos resultados e gravação",
    grupo: "exame",
  },
  {
    id: "consulta",
    label: "Consulta",
    titulo: "Consulta de exames",
    resumo: "Histórico, filtros e exportação CSV",
    grupo: "exame",
  },
  {
    id: "metodologia",
    label: "Metodologia",
    titulo: "Metodologia",
    resumo: "Passos da contagem em câmara de Neubauer",
    grupo: "referencia",
  },
  {
    id: "significado",
    label: "Significado clínico",
    titulo: "Significado clínico",
    resumo: "Interpretação dos achados no LCR",
    grupo: "referencia",
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

function Icone({ id }: { id: Aba }) {
  if (id === "registro") {
    return (
      <svg {...svgProps}>
        <path d="M8 7h8M8 12h8M8 17h5" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
      </svg>
    );
  }
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
  if (id === "laudo") {
    return (
      <svg {...svgProps}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  if (id === "consulta") {
    return (
      <svg {...svgProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    );
  }
  if (id === "metodologia") {
    return (
      <svg {...svgProps}>
        <path d="M9 5h11M9 12h11M9 19h11" />
        <path d="M4 5h.01M4 12h.01M4 19h.01" />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function BotaoMenu({
  item,
  ativo,
  onClick,
}: {
  item: (typeof ABAS)[number];
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={ativo ? "menu-item ativo" : "menu-item"}
      aria-current={ativo ? "page" : undefined}
      onClick={onClick}
    >
      <Icone id={item.id} />
      <span className="menu-item-label">{item.label}</span>
    </button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { aba, setAba } = useApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const atual = ABAS.find((item) => item.id === aba) ?? ABAS[0];
  const passoAtual = Math.max(1, FLUXO.indexOf(aba) + 1);

  function irPara(id: Aba) {
    setAba(id);
    setMenuAberto(false);
  }

  return (
    <div className={menuAberto ? "app-shell menu-aberto" : "app-shell"}>
      <aside className="menu-lateral">
        <div className="menu-marca">
          <strong className="marca-completa">CONTADOR LCR</strong>
          <strong className="marca-curta">LCR</strong>
          <span>Contagem celular de LCR</span>
        </div>

        <nav aria-label="Seções">
          <p className="menu-grupo">Exame</p>
          {ABAS.filter((item) => item.grupo === "exame").map((item) => (
            <BotaoMenu
              key={item.id}
              item={item}
              ativo={aba === item.id}
              onClick={() => irPara(item.id)}
            />
          ))}

          <p className="menu-grupo">Referência</p>
          {ABAS.filter((item) => item.grupo === "referencia").map((item) => (
            <BotaoMenu
              key={item.id}
              item={item}
              ativo={aba === item.id}
              onClick={() => irPara(item.id)}
            />
          ))}
        </nav>
      </aside>

      {menuAberto ? (
        <button
          type="button"
          className="menu-fundo"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      ) : null}

      <div className="app-principal">
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
            <h1>{atual.titulo}</h1>
            <p className="subtitulo-pagina">{atual.resumo}</p>
          </div>
        </header>

        {atual.grupo === "exame" ? (
          <div className="faixa-passos">
            <p className="passos-compacto">
              {passoAtual} de {FLUXO.length} · {atual.label}
            </p>
            <div className="passos-pilulas" role="navigation" aria-label="Fluxo do exame">
              {FLUXO.map((id, indice) => {
                const item = ABAS.find((abaItem) => abaItem.id === id)!;
                return (
                  <button
                    key={id}
                    type="button"
                    className={aba === id ? "passo ativo" : "passo"}
                    aria-current={aba === id ? "step" : undefined}
                    onClick={() => irPara(id)}
                  >
                    {indice + 1}. {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <main className="conteudo">
          <div key={aba} className="pagina-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
