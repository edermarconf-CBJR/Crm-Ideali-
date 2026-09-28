import { test, expect, type BrowserContext } from "@playwright/test";
import { criarCenario } from "../apoio/cenario";
import { criarImovel } from "../../src/imoveis/gravacao";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
let c: Awaited<ReturnType<typeof criarCenario>>;
test.beforeAll(async () => {
  c = await criarCenario();
});
test.afterAll(async () => {
  await c?.limpar();
});
async function preparar(context: BrowserContext) {
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
  return criarImovel(
    { id: c.gestor.id, perfil: "gestor" },
    { operacaoId: randomUUID(), tipo: "casa", cidade: "Cidade revisão" },
  );
}
async function foto() {
  return {
    name: "foto-teste.jpg",
    mimeType: "image/jpeg",
    buffer: await sharp({
      create: { width: 40, height: 40, channels: 3, background: "#987654" },
    })
      .jpeg()
      .toBuffer(),
  };
}
test("preserva fotos pendentes ao alternar abas", async ({ page, context }) => {
  const i = await preparar(context);
  await page.goto("/imoveis/" + i.id);
  await page.getByRole("button", { name: "Fotos e anúncio" }).click();
  await page.locator("#arquivos-foto").setInputFiles(await foto());
  await expect(
    page.getByText("1 arquivo selecionado", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Detalhes", exact: false }).click();
  await page.getByRole("button", { name: "Fotos e anúncio" }).click();
  await expect(
    page.getByText("1 arquivo selecionado", { exact: true }),
  ).toBeVisible();
});
test("retry de upload não permite salvar campos antigos sobre alteração de outra pessoa", async ({
  page,
  context,
}) => {
  const i = await preparar(context);
  await page.goto("/imoveis/" + i.id);
  await page
    .getByLabel("Bairro", { exact: true })
    .fill("Minha edição ainda não salva");
  await page.getByRole("button", { name: "Fotos e anúncio" }).click();
  await page.locator("#arquivos-foto").setInputFiles(await foto());
  let interrompido = false;
  await page.route("**/api/imoveis/" + i.id + "/arquivos?*", async (route) => {
    if (interrompido) {
      await route.continue();
      return;
    }
    interrompido = true;
    const r = await route.fetch();
    expect(r.ok()).toBe(true);
    await route.abort();
  });
  await page.getByRole("button", { name: "Enviar arquivos" }).click();
  await expect(
    page.getByRole("button", { name: "Enviar arquivos" }),
  ).toBeEnabled();
  const outra = await context.newPage();
  await outra.goto("/imoveis/" + i.id);
  await outra
    .getByLabel("Bairro", { exact: true })
    .fill("Bairro salvo pela outra pessoa");
  await outra.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    outra.getByText("Alterações salvas", { exact: true }),
  ).toBeVisible();
  await outra.close();
  await page.getByRole("button", { name: "Enviar arquivos" }).click();
  await expect(
    page.getByRole("heading", { name: "Confira o que mudou" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Salvar alterações" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "O imóvel" }).click();
  await expect(page.getByLabel("Bairro", { exact: true })).toHaveValue(
    "Minha edição ainda não salva",
  );
  const resposta = await context.request.get("/api/imoveis/" + i.id);
  expect((await resposta.json()).bairro).toBe("Bairro salvo pela outra pessoa");
});
test("espaços em quantidade continuam sem informação", async ({
  page,
  context,
}) => {
  const i = await preparar(context);
  await page.goto("/imoveis/" + i.id);
  await page.getByLabel("Quartos", { exact: true }).fill("   ");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByText("Alterações salvas", { exact: true }),
  ).toBeVisible();
  const r = await context.request.get("/api/imoveis/" + i.id);
  expect((await r.json()).quartos).toBeNull();
});
