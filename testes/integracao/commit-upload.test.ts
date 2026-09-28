import { test, expect, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import * as dados from "../../src/servidor/banco";
import { criarCenario } from "../apoio/cenario";
import { criarImovel } from "../../src/imoveis/gravacao";
import { adicionarArquivo } from "../../src/arquivos/servico";
import { armazenamento } from "../../src/arquivos/s3";
afterAll(() => dados.banco.end());
test("resposta perdida após COMMIT não remove objeto confirmado", async () => {
  const c = await criarCenario();
  try {
    const a = { id: c.gestor.id, perfil: "gestor" as const };
    const i = await criarImovel(a, {
      operacaoId: randomUUID(),
      tipo: "casa",
      cidade: "Cidade Teste",
    });
    const original = dados.transacao;
    vi.spyOn(dados, "transacao").mockImplementation(async (f) => {
      await original(f);
      throw new Error("Resposta do COMMIT perdida");
    });
    await expect(
      adicionarArquivo(a, i.id, {
        operacaoId: randomUUID(),
        versao: i.versao,
        categoria: "foto",
        nome: "foto.jpg",
        mimeInformado: "image/jpeg",
        bytes: await sharp({
          create: { width: 20, height: 20, channels: 3, background: "#444" },
        })
          .jpeg()
          .toBuffer(),
      }),
    ).rejects.toThrow("Resposta do COMMIT perdida");
    vi.restoreAllMocks();
    const arquivo = (
      await dados.banco.query("SELECT chave FROM arquivos WHERE imovel_id=$1", [
        i.id,
      ])
    ).rows[0];
    expect(arquivo).toBeDefined();
    const lido = await armazenamento.obter(arquivo.chave);
    expect(lido.bytes.length).toBeGreaterThan(0);
  } finally {
    vi.restoreAllMocks();
    await c.limpar();
  }
});
