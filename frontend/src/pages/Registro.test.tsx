import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppProvider, useApp } from "../context/AppContext";
import { Registro } from "./Registro";

function AbaProbe() {
  const { aba } = useApp();
  return <span data-testid="aba">{aba}</span>;
}

describe("Registro", () => {
  it("nao avanca sem operador e prontuario", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <AbaProbe />
        <Registro />
      </AppProvider>
    );
    expect(
      screen.getByText(/Preencha os campos obrigatórios/i)
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Ir para Contador/i }));
    expect(screen.getByTestId("aba")).toHaveTextContent("registro");
  });

  it("avanca quando operador e prontuario estao preenchidos", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <AbaProbe />
        <Registro />
      </AppProvider>
    );
    await user.type(
      screen.getByPlaceholderText(/Nome do técnico/i),
      "Ana Ribeiro"
    );
    await user.type(screen.getByPlaceholderText(/PR-100234/i), "PR-999");
    expect(screen.queryByText(/Preencha os campos obrigatórios/i)).toBeNull();
    await user.click(screen.getByRole("button", { name: /Ir para Contador/i }));
    expect(screen.getByTestId("aba")).toHaveTextContent("contador");
  });
});
