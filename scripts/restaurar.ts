import { argumento, ferramenta, hash, identidade } from "./copia-apoio";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Pool } from "pg";
import { z } from "zod";
import { CreateBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
const { s3 } = await import("../src/arquivos/s3");
if (process.env.RESTORE_MODE !== "isolado" || !process.env.RESTORE_DATABASE_URL)
  throw new Error("Defina RESTORE_MODE=isolado e RESTORE_DATABASE_URL.");
const origem = resolve(argumento("--origem"));
const alvo = argumento("--bucket-destino");
const bancoDestino = process.env.RESTORE_DATABASE_URL;
const manifesto = z
  .object({
    formato: z.literal(1),
    bancoOrigem: z.string(),
    bucketOrigem: z.string(),
    hashBanco: z.string().regex(/^[a-f0-9]{64}$/),
    migracoes: z.array(z.string()),
    arquivos: z.array(
      z.object({
        chave: z
          .string()
          .regex(/^(testes|imoveis)\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/),
        nome: z.string().regex(/^[a-f0-9-]{36}\.bin$/),
        mime: z.string(),
        hash: z.string().regex(/^[a-f0-9]{64}$/),
        tamanho: z.number().int().positive(),
      }),
    ),
  })
  .parse(JSON.parse(await readFile(join(origem, "manifesto.json"), "utf8")));
if (
  identidade(bancoDestino) === manifesto.bancoOrigem ||
  alvo === manifesto.bucketOrigem ||
  !/^restauracao-[a-z0-9-]+$/.test(alvo)
)
  throw new Error(
    "Destino deve ser um banco separado e um bucket novo restauracao-*.",
  );
if (hash(await readFile(join(origem, "banco.dump"))) !== manifesto.hashBanco)
  throw new Error("Backup do banco corrompido.");
for (const f of manifesto.arquivos) {
  const b = await readFile(join(origem, "objetos", f.nome));
  if (b.length !== f.tamanho || hash(b) !== f.hash)
    throw new Error("Arquivo corrompido: " + f.nome);
}
const db = new Pool({ connectionString: bancoDestino });
try {
  if (
    Number(
      (
        await db.query(
          "SELECT count(*) FROM pg_tables WHERE schemaname='public'",
        )
      ).rows[0].count,
    ) > 0
  )
    throw new Error(
      "O banco de destino precisa estar vazio; nenhum dado foi substituído.",
    );
  await s3.send(new CreateBucketCommand({ Bucket: alvo }));
  await ferramenta("pg_restore", bancoDestino, [
    "--exit-on-error",
    "--single-transaction",
    "--no-owner",
    "--no-acl",
    "--dbname",
    decodeURIComponent(new URL(bancoDestino).pathname.slice(1)),
    join(origem, "banco.dump"),
  ]);
  await db.query("DELETE FROM session; DELETE FROM verification");
  for (const f of manifesto.arquivos)
    await s3.send(
      new PutObjectCommand({
        Bucket: alvo,
        Key: f.chave,
        Body: await readFile(join(origem, "objetos", f.nome)),
        ContentType: f.mime,
      }),
    );
  const migracoes = (
    await db.query("SELECT nome FROM migracoes ORDER BY nome")
  ).rows.map((x) => x.nome);
  if (JSON.stringify(migracoes) !== JSON.stringify(manifesto.migracoes))
    throw new Error("Migrações divergentes.");
  console.log("Restauração concluída no destino isolado; sessões revogadas.");
} finally {
  await db.end();
}
