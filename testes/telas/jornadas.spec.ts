import { test, expect, type BrowserContext } from "@playwright/test";
import { criarCenario, senhaTeste, semearGestor } from "../apoio/cenario";
import { banco } from "../../src/servidor/banco";
import sharp from "sharp";
let c: Awaited<ReturnType<typeof criarCenario>>;
test.beforeAll(async () => {
  c = await criarCenario();
});
test.afterAll(async () => {
  await c.limpar();
});
async function sessao(context: BrowserContext, cookie: string) {
  await context.addCookies(
    cookie.split("; ").map((x) => {
      const n = x.indexOf("=");
      return {
        name: x.slice(0, n),
        value: x.slice(n + 1),
        domain: "127.0.0.1",
        path: "/",
      };
    }),
  );
}
for (const width of [320, 390, 1440])
  test(
    "rascunho, edição e saída em " + width + "px",
    async ({ page, context }) => {
      await sessao(context, (await semearGestor()).cookie);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/imoveis/novo");
      await page.getByLabel("Tipo do imóvel").selectOption("casa");
      await page
        .getByLabel("Cidade", { exact: true })
        .fill("Cidade Fictícia " + width);
      await page.getByRole("button", { name: "Salvar rascunho" }).click();
      await expect(
        page.getByText("Rascunho salvo", { exact: true }),
      ).toBeVisible();
      await page.getByLabel("Quartos", { exact: true }).fill("0");
      await page.getByLabel("Preço de venda (R$)").fill("250.000,00");
      await page.getByRole("button", { name: "Salvar alterações" }).click();
      await expect(
        page.getByText("Alterações salvas", { exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: ".dados/tela-" + width + ".png",
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Sair da conta" })
        .filter({ visible: true })
        .click();
      await expect(page).toHaveURL(/entrar/);
    },
  );
test("entrada real, falha de rede, conflito e arquivos", async ({
  page,
  context,
}) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(c.gestor.email);
  await page.getByLabel("Senha", { exact: true }).fill(senhaTeste);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/imoveis/);
  await page.getByRole("link", { name: "Novo imóvel" }).click();
  await page.getByLabel("Tipo do imóvel").selectOption("apartamento");
  await page.getByLabel("Cidade", { exact: true }).fill("Cidade Jornada");
  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect(page.getByText("Rascunho salvo", { exact: true })).toBeVisible();
  const url = page.url().split("?")[0];
  const id = url.split("/").pop()!;
  await page.getByLabel("Bairro", { exact: true }).fill("Bairro preservado");
  await page.route("**/api/imoveis/" + id, async (r) =>
    r.request().method() === "PATCH" ? r.abort() : r.continue(),
  );
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Seus dados continuam" }),
  ).toContainText("Seus dados continuam");
  await expect(page.getByLabel("Bairro", { exact: true })).toHaveValue(
    "Bairro preservado",
  );
  await page.unroute("**/api/imoveis/" + id);
  const outra = await context.newPage();
  await outra.goto(url);
  await outra.getByLabel("Bairro", { exact: true }).fill("Salvo por outra aba");
  await outra.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    outra.getByText("Alterações salvas", { exact: true }),
  ).toBeVisible();
  await outra.close();
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: "Confira o que mudou" }),
  ).toBeVisible();
  await expect(page.getByLabel("Bairro", { exact: true })).toHaveValue(
    "Bairro preservado",
  );
  await page.getByRole("button", { name: "Manter meu preenchimento" }).click();
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByText("Alterações salvas", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fotos e anúncio" }).click();
  const foto = await sharp({
    create: { width: 80, height: 50, channels: 3, background: "#b58b4d" },
  })
    .jpeg()
    .toBuffer();
  await page
    .locator("input[type=file]")
    .setInputFiles([
      { name: "foto-ficticia.jpg", mimeType: "image/jpeg", buffer: foto },
    ]);
  await page.getByRole("button", { name: /Enviar/ }).click();
  await expect(
    page.getByRole("img", { name: "Foto 1 do imóvel" }),
  ).toBeVisible();
  await page
    .getByLabel("Título do anúncio")
    .fill("Apartamento fictício de avaliação");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: "Apartamento fictício de avaliação" }),
  ).toBeVisible();
  await page.getByLabel("Situação comercial").selectOption("disponivel");
  await expect(
    page.getByText("Alteração salva", { exact: true }),
  ).toBeVisible();
  await page.goto("/imoveis?busca=NINGUEM-ENCONTRA-ESTE");
  await expect(
    page.getByRole("heading", { name: "Nenhum imóvel com esses filtros" }),
  ).toBeVisible();
});
