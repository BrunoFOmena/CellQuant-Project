import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "../context/AppContext";
import { Consulta } from "./Consulta";

function Harness() {
  const { setSecao } = useApp();
  useEffect(() => {
    setSecao("tabela");
  }, [setSecao]);
  return <Consulta />;
}

describe("Consulta", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("API fora mostra lista vazia e aviso, sem nomes mock", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline")))
    );

    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/API indisponível/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Não foi possível carregar os exames/i)).toBeInTheDocument();
    expect(screen.queryByText(/João Batista/i)).toBeNull();
    expect(screen.queryByText(/Ana Ribeiro/i)).toBeNull();
    expect(screen.queryByText(/PR-100234/i)).toBeNull();
    expect(screen.getByRole("button", { name: /Baixar CSV/i })).toBeDisabled();
  });
});
