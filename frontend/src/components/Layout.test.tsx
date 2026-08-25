import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function menu() {
  return within(screen.getByRole("navigation", { name: "Seções" }));
}

function fluxo() {
  return within(screen.getByRole("navigation", { name: "Fluxo do exame" }));
}

describe("layout monopage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("menu lateral tem 3 modulos e o contador navega no topo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline")))
    );
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Registro do exame" })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "CellQuant" })).toBeInTheDocument();
    expect(screen.getByText("Bruno Omena")).toBeInTheDocument();
    expect(screen.getByText("José Marcos")).toBeInTheDocument();
    expect(menu().getByRole("button", { name: "Acesso ao contador" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(fluxo().getByRole("button", { name: "Registro" })).toHaveAttribute(
      "aria-current",
      "step"
    );

    await user.click(menu().getByRole("button", { name: "Acesso à tabela" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Consulta de exames" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Fluxo do exame" })).toBeNull();

    await user.click(menu().getByRole("button", { name: "Acesso ao contador" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Registro do exame" })
    ).toBeInTheDocument();

    await user.click(fluxo().getByRole("button", { name: "Metodologia" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Metodologia" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Passos da contagem em câmara" })
    ).toBeInTheDocument();

    await user.click(menu().getByRole("button", { name: "Estatística dos dados" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Estatística dos dados" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Fluxo do exame" })).toBeNull();
  });
});
