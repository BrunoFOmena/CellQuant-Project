import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "../context/AppContext";
import { dataCivilLocal } from "../utils/data";
import { Laudo } from "./Laudo";

function SetupLaudo() {
  const { setRegistro, incrementar, aba, registro } = useApp();
  const pronto = useRef(false);
  useEffect(() => {
    if (pronto.current) return;
    pronto.current = true;
    setRegistro((r) => ({
      ...r,
      operador: "Ana Ribeiro",
      prontuario: "PR-1",
    }));
    incrementar("L");
  }, [incrementar, setRegistro]);
  return (
    <div>
      <span data-testid="aba">{aba}</span>
      <span data-testid="op">{registro.operador}</span>
      <Laudo />
    </div>
  );
}

describe("Laudo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("apos salvar limpa e vai para consulta", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string | URL, init?: RequestInit) => {
        const href = String(url);
        if (init?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 1 }),
          });
        }
        if (href.includes("/exames")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.reject(new Error("url inesperada"));
      })
    );

    render(
      <AppProvider>
        <SetupLaudo />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("op")).toHaveTextContent("Ana Ribeiro");
    });

    await user.click(screen.getByRole("button", { name: /Salvar registro/i }));

    await waitFor(() => {
      expect(screen.getByTestId("aba")).toHaveTextContent("consulta");
    });
    expect(screen.getByTestId("op")).toHaveTextContent("");
  });

  it("pede confirmacao se ja existe prontuario+data", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn(() => false);
    vi.stubGlobal("confirm", confirm);
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 2 }) });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 9,
                prontuario: "PR-1",
                data_exame: dataCivilLocal(),
                operador: "Ana Ribeiro",
              },
            ]),
        });
      })
    );

    render(
      <AppProvider>
        <SetupLaudo />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("op")).toHaveTextContent("Ana Ribeiro");
    });

    await user.click(screen.getByRole("button", { name: /Salvar registro/i }));

    await waitFor(() => {
      expect(confirm).toHaveBeenCalled();
    });
    expect(screen.getByTestId("aba")).toHaveTextContent("registro");
  });
});
