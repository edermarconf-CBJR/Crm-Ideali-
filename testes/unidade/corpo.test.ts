import { test, expect } from "vitest";
import { lerJson } from "../../src/servidor/corpo";
test("recusa JSON grande mesmo sem Content-Length", async () => {
  const req = new Request("http://localhost", {
    method: "POST",
    body: '"' + "x".repeat(131073) + '"',
  });
  await expect(lerJson(req)).rejects.toMatchObject({ codigo: "LIMITE" });
});
test("JSON inválido retorna erro de preenchimento", async () => {
  await expect(
    lerJson(new Request("http://localhost", { method: "POST", body: "{" })),
  ).rejects.toMatchObject({ codigo: "INVALIDO" });
});
