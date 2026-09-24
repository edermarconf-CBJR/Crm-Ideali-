import { test, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { POST } from "../../src/app/api/equipe/route";
import { criarCenario, requisicao } from "../apoio/cenario";
import { banco } from "../../src/servidor/banco";
afterAll(() => banco.end());
test("gestor convida sem duplicação e corretor não convida", async () => {
  const c = await criarCenario();
  try {
    const dados = {
      operacaoId: randomUUID(),
      nome: "Integrante fictício",
      email: randomUUID() + "@example.test",
      perfil: "corretor",
    };
    expect(
      (await POST(requisicao(c.corretorA, "/api/equipe", "POST", dados)))
        .status,
    ).toBe(403);
    const um = await POST(requisicao(c.gestor, "/api/equipe", "POST", dados));
    expect(um.status).toBe(201);
    const dois = await POST(requisicao(c.gestor, "/api/equipe", "POST", dados));
    expect((await dois.json()).id).toBe((await um.json()).id);
  } finally {
    await c.limpar();
  }
});
