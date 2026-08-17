import { expect, test } from "@playwright/test";

test("borda: sem prontuario permanece no registro", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Preencha os campos obrigatórios: Operador e Prontuário")
  ).toBeVisible();
  await page.getByRole("button", { name: "Ir para Contador →" }).click();
  await expect(page.getByRole("heading", { name: "IDENTIFICAÇÃO DO EXAME" })).toBeVisible();
});

test("fluxo: registro, contar, salvar e consultar", async ({ page }) => {
  const prontuario = `PR-E2E-${Date.now()}`;
  await page.goto("/");

  await page.getByPlaceholder("Nome do técnico / biomédico").fill("Tecnico E2E");
  await page.getByPlaceholder("Ex.: PR-100234").fill(prontuario);
  await page.getByRole("button", { name: "Ir para Contador →" }).click();

  await expect(page.getByRole("heading", { name: "LEUCÓCITOS" })).toBeVisible();
  await page.getByRole("button", { name: /Contar leucócitos/i }).click();
  await expect(page.locator(".resultado-box").first()).toContainText("céls/µL");

  await page.getByRole("button", { name: "Ir para Laudo →" }).click();
  await expect(page.getByText(prontuario)).toBeVisible();
  await page.getByRole("button", { name: "Salvar registro" }).click();

  await expect(page.getByRole("heading", { name: "Consulta de exames" })).toBeVisible();
  await expect(page.getByRole("cell", { name: prontuario })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "REGISTRO" }).click();
  await expect(page.getByPlaceholder("Nome do técnico / biomédico")).toHaveValue("");
  await expect(page.getByPlaceholder("Ex.: PR-100234")).toHaveValue("");
});
