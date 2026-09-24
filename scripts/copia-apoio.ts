import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
if (existsSync(".env.local")) loadEnvFile(".env.local");
export function argumento(nome: string) {
  const n = process.argv.indexOf(nome);
  if (n < 0 || !process.argv[n + 1] || process.argv[n + 1].startsWith("--"))
    throw new Error("Informe " + nome);
  return process.argv[n + 1];
}
export const hash = (b: Uint8Array) =>
  createHash("sha256").update(b).digest("hex");
export function identidade(url: string) {
  const u = new URL(url);
  return [u.hostname, u.port || "5432", u.pathname].join("|");
}
export async function ferramenta(
  nome: "pg_dump" | "pg_restore",
  url: string,
  args: string[],
) {
  const u = new URL(url);
  const pasta =
    process.env.PG_TOOLS_DIR ??
    (process.platform === "win32"
      ? resolve(".dados/ferramentas/postgres-backup-17.11/bin")
      : "");
  const bin = pasta
    ? join(pasta, nome + (process.platform === "win32" ? ".exe" : ""))
    : nome;
  await new Promise<void>((ok, falha) => {
    const p = spawn(bin, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
      env: {
        ...process.env,
        PGHOST: u.hostname,
        PGPORT: u.port || "5432",
        PGDATABASE: decodeURIComponent(u.pathname.slice(1)),
        PGUSER: decodeURIComponent(u.username),
        PGPASSWORD: decodeURIComponent(u.password),
        PGSSLMODE: u.searchParams.get("sslmode") ?? "prefer",
      },
    });
    let err = "";
    p.stderr.on("data", (b) => {
      err += String(b);
    });
    p.on("error", () =>
      falha(
        new Error(
          "Ferramenta PostgreSQL não encontrada. Configure PG_TOOLS_DIR.",
        ),
      ),
    );
    p.on("exit", (c) =>
      c === 0
        ? ok()
        : falha(
            new Error(
              nome + " falhou; confira o ambiente. " + err.slice(0, 800),
            ),
          ),
    );
  });
}
