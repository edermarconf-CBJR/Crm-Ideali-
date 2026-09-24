import { loadEnvFile } from "node:process";
import { createInterface } from "node:readline/promises";
import { randomBytes } from "node:crypto";
loadEnvFile(".env.local");
const { auth } = await import("../src/acesso/auth");
const { banco, transacao } = await import("../src/servidor/banco");
const rl = createInterface({ input: process.stdin, output: process.stdout });
const nome = (await rl.question("Nome do primeiro gestor: ")).trim();
const email = (await rl.question("E-mail do primeiro gestor: "))
  .trim()
  .toLowerCase();
rl.close();
if (nome.length < 2 || !email.includes("@"))
  throw new Error("Informe nome e e-mail válidos.");
if (
  (
    await banco.query(
      "SELECT 1 FROM membros WHERE perfil='gestor' AND estado IN ('ativo','convidado')",
    )
  ).rowCount
)
  throw new Error("Já existe gestor. Use a gestão da equipe.");
const existente = (
  await banco.query('SELECT id FROM "user" WHERE email=$1', [email])
).rows[0];
const id =
  existente?.id ??
  (
    await auth.api.createUser({
      body: {
        name: nome,
        email,
        password: randomBytes(48).toString("base64url"),
        role: "user",
      },
    })
  ).user.id;
await transacao(async (tx) => {
  await tx.query("SELECT id FROM controle_equipe WHERE id=1 FOR UPDATE");
  if (
    (
      await tx.query(
        "SELECT 1 FROM membros WHERE perfil='gestor' AND estado IN ('ativo','convidado')",
      )
    ).rowCount
  )
    throw new Error("Já existe gestor.");
  await tx.query(
    "INSERT INTO membros(id,perfil,estado) VALUES($1,'gestor','convidado')",
    [id],
  );
});
await auth.api.requestPasswordReset({ body: { email } });
console.log("Convite preparado. Confira a caixa de e-mail configurada.");
await banco.end();
