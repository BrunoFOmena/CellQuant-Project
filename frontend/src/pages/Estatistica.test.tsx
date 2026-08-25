import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../context/AppContext";
import { Estatistica } from "./Estatistica";

describe("Estatistica", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("API fora mostra aviso sem dados mock", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline")))
    );

    render(
      <AppProvider>
        <Estatistica />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/API indisponível/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Exames gravados/i)).toBeNull();
  });

  it("com exames mostra totais e medias", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                data_exame: "2026-08-01",
                operador: "Ana",
                prontuario: "PR-1",
                leucocitos_ul: 10,
                hemacias_ul: 20,
                poli_pct: 80,
                mono_pct: 20,
              },
              {
                id: 2,
                data_exame: "2026-08-10",
                operador: "Ana",
                prontuario: "PR-2",
                leucocitos_ul: 30,
                hemacias_ul: 40,
                poli_pct: 20,
                mono_pct: 80,
              },
            ]),
        })
      )
    );

    render(
      <AppProvider>
        <Estatistica />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Exames gravados")).toBeInTheDocument();
    });
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/20 \/µL/)).toBeInTheDocument();
    expect(screen.getByText(/01\/08\/2026 — 10\/08\/2026/)).toBeInTheDocument();
  });
});
