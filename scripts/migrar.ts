import { loadEnvFile } from "node:process";
import { readdir, readFile } from "node:fs/promises";
loadEnvFile(".env.local");
if (process.argv.includes("--teste"))
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { banco, transacao } = await import("../src/servidor/banco");
await transacao(async (tx) => {
  await tx.query("SELECT pg_advisory_xact_lock(739120)");
  await tx.query(
    "CREATE TABLE IF NOT EXISTS migracoes(nome text PRIMARY KEY,aplicada_em timestamptz DEFAULT now())",
  );
  for (const n of (await readdir("migracoes"))
    .filter((x) => x.endsWith(".sql"))
    .sort()) {
    if ((await tx.query("SELECT 1 FROM migracoes WHERE nome=$1", [n])).rowCount)
      continue;
    await tx.query(await readFile("migracoes/" + n, "utf8"));
    await tx.query("INSERT INTO migracoes(nome) VALUES($1)", [n]);
    console.log("Migração aplicada:", n);
  }
});
await banco.end();
