import { argumento, ferramenta, hash, identidade } from "./copia-apoio";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Pool } from "pg";
const { armazenamento, bucket } = await import("../src/arquivos/s3");
if (process.env.CRM_MANUTENCAO !== "1")
  throw new Error("Pare a aplicação e confirme CRM_MANUTENCAO=1.");
const destino = resolve(argumento("--destino"));
await mkdir(destino, { recursive: true });
try {
  await access(join(destino, "manifesto.json"));
  throw new Error("Use uma pasta nova para cada backup.");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const tx = await db.connect();
try {
  await tx.query("BEGIN");
  await tx.query("SET LOCAL lock_timeout='10s'");
  const tabelas = (
    await tx.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")
  ).rows;
  if (!tabelas.some((t) => t.tablename === "imoveis"))
    throw new Error("Banco do CRM não encontrado.");
  await tx.query(
    "LOCK TABLE " +
      tabelas
        .map((t) => '"' + t.tablename.replaceAll('"', '""') + '"')
        .join(",") +
      " IN SHARE MODE",
  );
  await ferramenta("pg_dump", process.env.DATABASE_URL!, [
    "--format=custom",
    "--no-owner",
    "--no-acl",
    "--file",
    join(destino, "banco.dump"),
  ]);
  await mkdir(join(destino, "objetos"), { recursive: true });
  const arquivos = [];
  for (const f of (
    await tx.query(
      "SELECT id,chave,mime FROM arquivos WHERE removido_em IS NULL ORDER BY id",
    )
  ).rows) {
    const { bytes } = await armazenamento.obter(f.chave);
    const nome = f.id + ".bin";
    await writeFile(join(destino, "objetos", nome), bytes);
    arquivos.push({
      chave: f.chave,
      nome,
      mime: f.mime,
      hash: hash(bytes),
      tamanho: bytes.length,
    });
  }
  const manifesto = {
    formato: 1,
    criadoEm: new Date().toISOString(),
    bancoOrigem: identidade(process.env.DATABASE_URL!),
    bucketOrigem: bucket(),
    hashBanco: hash(await readFile(join(destino, "banco.dump"))),
    migracoes: (
      await tx.query("SELECT nome FROM migracoes ORDER BY nome")
    ).rows.map((x) => x.nome),
    arquivos,
  };
  await writeFile(
    join(destino, "manifesto.json"),
    JSON.stringify(manifesto, null, 2),
  );
  await tx.query("COMMIT");
  console.log("Backup concluído: banco e " + arquivos.length + " arquivos.");
} catch (e) {
  await tx.query("ROLLBACK");
  throw e;
} finally {
  tx.release();
  await db.end();
}
