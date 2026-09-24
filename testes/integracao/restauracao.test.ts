import { test, expect, afterAll } from "vitest";
import { randomUUID, createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { Pool } from "pg";
import sharp from "sharp";
import { criarCenario } from "../apoio/cenario";
import { banco } from "../../src/servidor/banco";
import { criarImovel } from "../../src/imoveis/gravacao";
import { transferirImovel } from "../../src/equipe/servico";
import { adicionarArquivo } from "../../src/arquivos/servico";
import { s3, armazenamento } from "../../src/arquivos/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
afterAll(() => banco.end());
test("backup real restaura banco, arquivos, vínculos e revoga sessões", async () => {
  const c = await criarCenario();
  const a = { id: c.gestor.id, perfil: "gestor" as const };
  const origem = new URL(process.env.DATABASE_URL!);
  origem.pathname = "/ideali_restauracao_teste";
  const db = new Pool({ connectionString: origem.toString() });
  try {
    let i = await criarImovel(a, {
      operacaoId: randomUUID(),
      tipo: "casa",
      cidade: "Cidade sintética",
    });
    for (let n = 0; n < 2; n++)
      await criarImovel(a, {
        operacaoId: randomUUID(),
        tipo: "terreno",
        cidade: "Teste " + n,
      });
    for (const cor of ["#777", "#999"])
      i = await adicionarArquivo(a, i.id, {
        operacaoId: randomUUID(),
        versao: i.versao,
        categoria: "foto",
        nome: "Teste.jpg",
        mimeInformado: "image/jpeg",
        bytes: await sharp({
          create: { width: 20, height: 20, channels: 3, background: cor },
        })
          .jpeg()
          .toBuffer(),
      });
    i = await adicionarArquivo(a, i.id, {
      operacaoId: randomUUID(),
      versao: i.versao,
      categoria: "documento",
      nome: "Ficticio.pdf",
      mimeInformado: "application/pdf",
      bytes: Buffer.from("%PDF-1.4\n% ficticio\n%%EOF"),
    });
    await transferirImovel(a, i.id, {
      operacaoId: randomUUID(),
      versao: i.versao,
      destinoId: c.corretorA.id,
    });
    const arquivos = (
      await banco.query(
        "SELECT chave FROM arquivos WHERE removido_em IS NULL ORDER BY chave",
      )
    ).rows;
    const hashes = await Promise.all(
      arquivos.map(async (f) =>
        createHash("sha256")
          .update((await armazenamento.obter(f.chave)).bytes)
          .digest("hex"),
      ),
    );
    const pasta = ".dados/backup-teste-" + randomUUID();
    await mkdir(pasta, { recursive: true });
    const env = {
      ...process.env,
      CRM_MANUTENCAO: "1",
      RESTORE_DATABASE_URL: origem.toString(),
      RESTORE_MODE: "isolado",
    };
    const executar = (script: string, args: string[]) => {
      const r = spawnSync(
        process.execPath,
        [
          "--conditions=react-server",
          "--import",
          "tsx",
          "scripts/" + script,
          ...args,
        ],
        { env, encoding: "utf8", windowsHide: true, timeout: 60000 },
      );
      expect(r.status, r.stderr).toBe(0);
    };
    executar("backup.ts", ["--destino", pasta]);
    const manifesto = JSON.parse(
      await readFile(pasta + "/manifesto.json", "utf8"),
    );
    expect(manifesto.arquivos).toHaveLength(3);
    await db.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
    const bucket = "restauracao-" + randomUUID();
    executar("restaurar.ts", ["--origem", pasta, "--bucket-destino", bucket]);
    expect(
      Number((await db.query("SELECT count(*) FROM imoveis")).rows[0].count),
    ).toBe(3);
    expect(
      Number((await db.query("SELECT count(*) FROM membros")).rows[0].count),
    ).toBe(3);
    expect(
      Number((await db.query("SELECT count(*) FROM session")).rows[0].count),
    ).toBe(0);
    expect(
      (await db.query("SELECT responsavel_id FROM imoveis WHERE id=$1", [i.id]))
        .rows[0].responsavel_id,
    ).toBe(c.corretorA.id);
    expect(
      Number(
        (
          await db.query(
            "SELECT count(*) FROM historico WHERE entidade_id=$1",
            [i.id],
          )
        ).rows[0].count,
      ),
    ).toBeGreaterThan(3);
    const restaurados = await Promise.all(
      arquivos.map(async (f) => {
        const o = await s3.send(
          new GetObjectCommand({ Bucket: bucket, Key: f.chave }),
        );
        return createHash("sha256")
          .update(await o.Body!.transformToByteArray())
          .digest("hex");
      }),
    );
    expect(restaurados).toEqual(hashes);
    expect(
      (
        await db.query(
          "SELECT count(*) FROM imoveis i LEFT JOIN membros m ON m.id=i.responsavel_id WHERE m.id IS NULL",
        )
      ).rows[0].count,
    ).toBe("0");
  } finally {
    await db.end();
    await c.limpar();
  }
}, 120000);
