import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { criarCenario } from "../apoio/cenario";
import { banco } from "../../src/servidor/banco";
import { criarImovel } from "../../src/imoveis/gravacao";
test("gestor convida, transfere imóvel e desativa com destino", async ({
  page,
  context,
}) => {
  const c = await criarCenario();
  try {
    await context.addCookies(
      c.gestor.cookie.split("; ").map((x) => {
        const n = x.indexOf("=");
        return {
          name: x.slice(0, n),
          value: x.slice(n + 1),
          domain: "127.0.0.1",
          path: "/",
        };
      }),
    );
    await banco.query('UPDATE "user" SET name=$2 WHERE id=$1', [
      c.corretorA.id,
      "Corretor A fictício",
    ]);
    await banco.query('UPDATE "user" SET name=$2 WHERE id=$1', [
      c.corretorB.id,
      "Corretor B fictício",
    ]);
    const i = await criarImovel(
      { id: c.gestor.id, perfil: "gestor" },
      { operacaoId: randomUUID(), tipo: "casa", cidade: "Cidade Equipe" },
    );
    await page.goto("/imoveis/" + i.id);
    await page
      .getByLabel("Integrante responsável")
      .selectOption(c.corretorA.id);
    await page.getByRole("button", { name: "Transferir imóvel" }).click();
    await expect(
      page.getByText("Alteração salva", { exact: true }),
    ).toBeVisible();
    await page.goto("/equipe");
    await page.getByRole("button", { name: "Convidar integrante" }).click();
    const d = page.getByRole("dialog");
    await expect(d).toBeVisible();
    await d
      .getByLabel("Nome", { exact: true })
      .fill("Pessoa convidada fictícia");
    await d.getByLabel("E-mail").fill(randomUUID() + "@example.test");
    await d.getByRole("button", { name: "Enviar convite" }).click();
    await expect(d).not.toBeVisible();
    await expect(
      page.getByText("Pessoa convidada fictícia", { exact: true }),
    ).toBeVisible();
    await page
      .locator("article")
      .filter({ hasText: "Corretor A fictício" })
      .getByRole("button", { name: "Desativar" })
      .click();
    await expect(d).toContainText("1 imóveis serão transferidos");
    await d.getByLabel("Transferir imóveis para").selectOption(c.corretorB.id);
    await d.getByRole("button", { name: "Confirmar desativação" }).click();
    await expect(d).not.toBeVisible();
    expect(
      (
        await banco.query("SELECT responsavel_id FROM imoveis WHERE id=$1", [
          i.id,
        ])
      ).rows[0].responsavel_id,
    ).toBe(c.corretorB.id);
    await page.setViewportSize({ width: 320, height: 740 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  } finally {
    await c.limpar();
  }
});
