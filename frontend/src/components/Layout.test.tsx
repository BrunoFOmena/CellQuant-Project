import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function menu() {
  return within(screen.getByRole("navigation", { name: "Seções" }));
}

describe("layout monopage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra a secao ativa e troca pelo menu lateral", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline")))
    );
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Registro do exame" })
    ).toBeInTheDocument();
    expect(menu().getByRole("button", { name: "Registro" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      screen.getByRole("navigation", { name: "Fluxo do exame" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1. Registro" })).toHaveAttribute(
      "aria-current",
      "step"
    );

    await user.click(menu().getByRole("button", { name: "Consulta" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Consulta de exames" })
    ).toBeInTheDocument();
    expect(menu().getByRole("button", { name: "Consulta" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    await user.click(menu().getByRole("button", { name: "Metodologia" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Metodologia" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Passos da contagem em câmara" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Fluxo do exame" })).toBeNull();
  });
});
