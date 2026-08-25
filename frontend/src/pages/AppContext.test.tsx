import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppProvider, useApp } from "../context/AppContext";

function Probe() {
  const a = useApp();
  return (
    <div>
      <span data-testid="aba">{a.aba}</span>
      <span data-testid="secao">{a.secao}</span>
      <span data-testid="hema-q">{a.registro.quadrantes_hema}</span>
      <span data-testid="leuco-q">{a.registro.quadrantes_leuco}</span>
      <span data-testid="leuco">{a.contagem.leuco}</span>
      <span data-testid="hema">{a.contagem.hema}</span>
      <span data-testid="poli">{a.contagem.poli}</span>
      <span data-testid="mono">{a.contagem.mono}</span>
      <span data-testid="op">{a.registro.operador}</span>
      <button type="button" onClick={() => a.incrementar("L")}>
        inc-L
      </button>
      <button type="button" onClick={() => a.incrementar("E")}>
        inc-E
      </button>
      <button type="button" onClick={() => a.desfazer()}>
        undo
      </button>
      <button type="button" onClick={() => a.zerarContagem()}>
        zero
      </button>
      <button type="button" onClick={() => a.limparTudo()}>
        limpar
      </button>
      <button type="button" onClick={() => a.setAba("consulta")}>
        aba-consulta
      </button>
      <button type="button" onClick={() => a.setAba("laudo")}>
        aba-laudo
      </button>
      <button type="button" onClick={() => a.setSecao("tabela")}>
        secao-tabela
      </button>
      <button type="button" onClick={() => a.setSecao("contador")}>
        secao-contador
      </button>
      <button
        type="button"
        onClick={() => a.setRegistro((r) => ({ ...r, operador: "Ana" }))}
      >
        set-op
      </button>
    </div>
  );
}

describe("AppContext", () => {
  it("padrao de hemácias e 1 quadrante e leucocitos 4", () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>
    );
    expect(screen.getByTestId("hema-q")).toHaveTextContent("1");
    expect(screen.getByTestId("leuco-q")).toHaveTextContent("4");
    expect(screen.getByTestId("aba")).toHaveTextContent("registro");
  });

  it("incrementa, desfaz e zera sem mudar a aba", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Probe />
      </AppProvider>
    );
    await user.click(screen.getByText("inc-L"));
    await user.click(screen.getByText("inc-E"));
    expect(screen.getByTestId("leuco")).toHaveTextContent("1");
    expect(screen.getByTestId("hema")).toHaveTextContent("1");
    await user.click(screen.getByText("undo"));
    expect(screen.getByTestId("hema")).toHaveTextContent("0");
    await user.click(screen.getByText("zero"));
    expect(screen.getByTestId("leuco")).toHaveTextContent("0");
    expect(screen.getByTestId("aba")).toHaveTextContent("registro");
  });

  it("limparTudo nao muda a aba", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Probe />
      </AppProvider>
    );
    await user.click(screen.getByText("set-op"));
    await user.click(screen.getByText("inc-L"));
    await user.click(screen.getByText("aba-consulta"));
    expect(screen.getByTestId("aba")).toHaveTextContent("consulta");
    await user.click(screen.getByText("limpar"));
    expect(screen.getByTestId("op")).toHaveTextContent("");
    expect(screen.getByTestId("leuco")).toHaveTextContent("0");
    expect(screen.getByTestId("aba")).toHaveTextContent("consulta");
  });

  it("depois de limpar no laudo, voltar ao contador abre o registro", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Probe />
      </AppProvider>
    );
    await user.click(screen.getByText("aba-laudo"));
    await user.click(screen.getByText("set-op"));
    await user.click(screen.getByText("limpar"));
    await user.click(screen.getByText("secao-tabela"));
    expect(screen.getByTestId("secao")).toHaveTextContent("tabela");
    await user.click(screen.getByText("secao-contador"));
    expect(screen.getByTestId("secao")).toHaveTextContent("contador");
    expect(screen.getByTestId("aba")).toHaveTextContent("registro");
    expect(screen.getByTestId("op")).toHaveTextContent("");
  });
});
