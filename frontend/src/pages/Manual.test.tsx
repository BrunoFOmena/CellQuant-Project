import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function menu() {
  return within(screen.getByRole("navigation", { name: "Seções" }));
}

describe("entrada manual", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("salva exame digitado e vai para a tabela", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn((url: string | URL, init?: RequestInit) => {
      const href = String(url);
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 7 }),
        });
      }
      if (href.includes("/exames")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error("url inesperada"));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await user.click(menu().getByRole("button", { name: "Adicionar manualmente" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Entrada manual" })
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Nome do técnico / biomédico"),
      "Ana"
    );
    await user.type(screen.getByPlaceholderText("Ex.: PR-100234"), "PR-MAN");
    await user.type(screen.getByLabelText("Total de leucócitos"), "8");

    await user.click(screen.getByRole("button", { name: "Salvar registro" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/exames",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(
      screen.getByRole("heading", { level: 1, name: "Consulta de exames" })
    ).toBeInTheDocument();
  });
});
