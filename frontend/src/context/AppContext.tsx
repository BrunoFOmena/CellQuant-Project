// Estado global da contagem atual e navegação entre abas
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Aba, ContagemState, RegistroState, Secao } from "../types/exame";
import { celulasPorUL, percentual } from "../utils/calculo";
import { dataCivilLocal } from "../utils/data";

type AppContextValue = {
  secao: Secao;
  setSecao: (secao: Secao) => void;
  aba: Aba;
  setAba: (aba: Aba) => void;
  registro: RegistroState;
  setRegistro: React.Dispatch<React.SetStateAction<RegistroState>>;
  contagem: ContagemState;
  incrementar: (tipo: "L" | "E" | "N" | "M") => void;
  desfazer: () => void;
  zerarContagem: () => void;
  limparTudo: () => void;
  resultados: {
    leucoUl: number;
    hemaUl: number;
    totalDiff: number;
    poliPct: number;
    monoPct: number;
  };
  registroCompleto: boolean;
};

const registroInicial: RegistroState = {
  operador: "",
  prontuario: "",
  paciente: "",
  data_exame: dataCivilLocal(),
  quadrantes_leuco: 4,
  diluicao_leuco: 1,
  quadrantes_hema: 1,
  diluicao_hema: 1,
  observacoes: "",
};

const contagemInicial: ContagemState = {
  leuco: 0,
  hema: 0,
  poli: 0,
  mono: 0,
  historico: [],
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [secao, setSecaoState] = useState<Secao>("contador");
  const [aba, setAbaState] = useState<Aba>("registro");
  const ultimaAbaContador = useRef<Aba>("registro");

  function setAba(next: Aba) {
    if (next !== "consulta") ultimaAbaContador.current = next;
    setAbaState(next);
  }

  function setSecao(next: Secao) {
    setSecaoState(next);
    if (next === "tabela") {
      setAbaState("consulta");
    } else if (next === "contador") {
      const volta =
        ultimaAbaContador.current === "consulta"
          ? "registro"
          : ultimaAbaContador.current;
      setAbaState(volta);
    }
  }

  // Dados do formulário
  const [registro, setRegistro] = useState<RegistroState>(registroInicial);
  // Contagens ao vivo
  const [contagem, setContagem] = useState<ContagemState>(contagemInicial);

  // Soma +1 conforme o tipo
  function incrementar(tipo: "L" | "E" | "N" | "M") {
    setContagem((prev) => {
      const next = { ...prev, historico: [...prev.historico, tipo] };
      if (tipo === "L") next.leuco += 1;
      if (tipo === "E") next.hema += 1;
      if (tipo === "N") next.poli += 1;
      if (tipo === "M") next.mono += 1;
      return next;
    });
  }

  // Desfaz o último toque
  function desfazer() {
    setContagem((prev) => {
      const historico = [...prev.historico];
      const ultimo = historico.pop();
      if (!ultimo) return prev;
      const next = { ...prev, historico };
      if (ultimo === "L" && next.leuco > 0) next.leuco -= 1;
      if (ultimo === "E" && next.hema > 0) next.hema -= 1;
      if (ultimo === "N" && next.poli > 0) next.poli -= 1;
      if (ultimo === "M" && next.mono > 0) next.mono -= 1;
      return next;
    });
  }

  // Zera só a contagem (não o registro)
  function zerarContagem() {
    setContagem(contagemInicial);
  }

  // Limpa registro + contagem e prepara um exame novo ao voltar ao contador
  function limparTudo() {
    ultimaAbaContador.current = "registro";
    setRegistro({ ...registroInicial, data_exame: dataCivilLocal() });
    setContagem(contagemInicial);
  }

  // Resultados calculados
  const resultados = useMemo(() => {
    const totalDiff = contagem.poli + contagem.mono;
    return {
      leucoUl: celulasPorUL(
        contagem.leuco,
        registro.diluicao_leuco,
        registro.quadrantes_leuco
      ),
      hemaUl: celulasPorUL(
        contagem.hema,
        registro.diluicao_hema,
        registro.quadrantes_hema
      ),
      totalDiff,
      poliPct: percentual(contagem.poli, totalDiff),
      monoPct: percentual(contagem.mono, totalDiff),
    };
  }, [contagem, registro]);

  const registroCompleto =
    registro.operador.trim() !== "" && registro.prontuario.trim() !== "";

  const value: AppContextValue = {
    secao,
    setSecao,
    aba,
    setAba,
    registro,
    setRegistro,
    contagem,
    incrementar,
    desfazer,
    zerarContagem,
    limparTudo,
    resultados,
    registroCompleto,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
