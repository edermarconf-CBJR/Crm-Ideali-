import { verificarBancoTeste } from "../../scripts/ambiente-teste.mjs";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { auth } from "../../src/acesso/auth";
import { banco } from "../../src/servidor/banco";
export const senhaTeste = "SenhaFicticiaDeTeste123!";
export type SessaoTeste = { id: string; cookie: string; email: string };
async function conferirDestino() {
  const url = verificarBancoTeste();
  const atual = (await banco.query("SELECT current_database() AS nome")).rows[0]
    .nome;
  if (
    atual !== decodeURIComponent(new URL(url).pathname.slice(1)) ||
    !atual.endsWith("_teste")
  )
    throw new Error("Conexão exige banco isolado de testes.");
}
export async function prepararBanco() {
  await conferirDestino();
  await banco.query(
    "CREATE TABLE IF NOT EXISTS migracoes(nome text PRIMARY KEY,aplicada_em timestamptz DEFAULT now())",
  );
  for (const nome of (await readdir("migracoes"))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    if (
      (await banco.query("SELECT 1 FROM migracoes WHERE nome=$1", [nome]))
        .rowCount
    )
      continue;
    await banco.query(await readFile("migracoes/" + nome, "utf8"));
    await banco.query("INSERT INTO migracoes(nome) VALUES($1)", [nome]);
  }
}
export async function semearUsuario(
  perfil: "gestor" | "corretor" = "corretor",
): Promise<SessaoTeste> {
  await conferirDestino();
  const email = randomUUID() + "@example.test";
  const { user } = await auth.api.createUser({
    body: {
      name: "Pessoa fictícia",
      email,
      password: senhaTeste,
      role: "user",
    },
  });
  await banco.query(
    "INSERT INTO membros(id,perfil,estado) VALUES($1,$2,'ativo')",
    [user.id, perfil],
  );
  const r = await auth.api.signInEmail({
    body: { email, password: senhaTeste },
    asResponse: true,
  });
  return {
    id: user.id,
    email,
    cookie: r.headers
      .getSetCookie()
      .map((x) => x.split(";")[0])
      .join("; "),
  };
}
export const semearGestor = () => semearUsuario("gestor");
export async function criarCenario() {
  await prepararBanco();
  return {
    gestor: await semearGestor(),
    corretorA: await semearUsuario(),
    corretorB: await semearUsuario(),
    limpar: async () => {
      await conferirDestino();
      await banco.query('TRUNCATE "user" CASCADE');
      await banco.query('TRUNCATE "rateLimit"');
    },
  };
}
export function requisicao(
  ator: SessaoTeste | null,
  caminho: string,
  metodo = "GET",
  corpo?: unknown,
) {
  return new Request(process.env.APP_ORIGIN + caminho, {
    method: metodo,
    headers: {
      origin: process.env.APP_ORIGIN!,
      cookie: ator?.cookie ?? "",
      "content-type": "application/json",
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
}
