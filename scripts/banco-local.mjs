import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
mkdirSync(".dados", { recursive: true });
const arquivo = ".dados/banco-local.json";
const cred = existsSync(arquivo)
  ? JSON.parse(readFileSync(arquivo, "utf8"))
  : { password: randomBytes(24).toString("hex") };
writeFileSync(arquivo, JSON.stringify(cred));
const banco = new EmbeddedPostgres({
  databaseDir: ".dados/postgres",
  user: "ideali",
  password: cred.password,
  port: 55432,
  persistent: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
if (!existsSync(".dados/postgres/PG_VERSION")) await banco.initialise();
await banco.start();
for (const nome of ["ideali", "ideali_teste", "ideali_restauracao_teste"]) {
  const c = banco.getPgClient("postgres");
  await c.connect();
  if (
    !(await c.query("SELECT 1 FROM pg_database WHERE datname=$1", [nome]))
      .rowCount
  )
    await c.query("CREATE DATABASE " + nome);
  await c.end();
}
const env =
  "DATABASE_URL=postgresql://ideali:" +
  cred.password +
  "@127.0.0.1:55432/ideali\nTEST_DATABASE_URL=postgresql://ideali:" +
  cred.password +
  "@127.0.0.1:55432/ideali_teste\nAPP_ORIGIN=http://127.0.0.1:3100\nBETTER_AUTH_SECRET=" +
  randomBytes(40).toString("hex") +
  "\nSMTP_HOST=127.0.0.1\nSMTP_PORT=1025\nSMTP_FROM=Ideali <acesso@example.test>\n";
if (!existsSync(".env.local")) writeFileSync(".env.local", env);
const c = banco.getPgClient("postgres");
await c.connect();
console.log(
  "PostgreSQL local:",
  (await c.query("SHOW server_version")).rows[0].server_version,
);
await c.end();
process.on("SIGINT", async () => {
  await banco.stop();
  process.exit(0);
});
setInterval(() => {}, 30000);
