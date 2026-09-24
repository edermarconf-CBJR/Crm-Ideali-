import "server-only";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { z } from "zod";
import { auth } from "./auth";
import { exigirGestor, bloquearAtor } from "./ator";
import { banco, transacao, type Tx } from "../servidor/banco";
import { executarUmaVez } from "../servidor/operacoes";
import { ErroDominio } from "../compartilhado/erros";
import type { Ator, Membro } from "../compartilhado/contratos";
const locks = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 1000,
});
const schema = z
  .object({
    operacaoId: z.uuid(),
    nome: z.string().trim().min(2).max(120),
    email: z.email().transform((x) => x.toLowerCase()),
    perfil: z.enum(["gestor", "corretor"]),
  })
  .strict();
export async function membroPorId(tx: Tx, id: string): Promise<Membro> {
  const r = await tx.query(
    'SELECT m.id,u.name AS nome,u.email,m.perfil,m.estado,m.versao FROM membros m JOIN "user" u ON u.id=m.id WHERE m.id=$1',
    [id],
  );
  if (!r.rows[0])
    throw new ErroDominio("NAO_ENCONTRADO", "Integrante não encontrado.");
  return r.rows[0];
}
export async function convidarMembro(
  ator: Ator,
  entrada: unknown,
): Promise<Membro> {
  exigirGestor(ator);
  const d = schema.parse(entrada);
  const lock = await locks.connect();
  try {
    await lock.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [
      "convite:" + d.email,
    ]);
    const atual = await banco.query('SELECT id FROM "user" WHERE email=$1', [
      d.email,
    ]);
    let id = atual.rows[0]?.id as string | undefined;
    if (!id) {
      const u = await auth.api.createUser({
        body: {
          name: d.nome,
          email: d.email,
          password: randomBytes(48).toString("base64url"),
          role: "user",
        },
      });
      id = u.user.id;
    }
    const usuarioId = id;
    const membro = await transacao(async (tx) => {
      await tx.query("SELECT id FROM controle_equipe WHERE id=1 FOR UPDATE");
      exigirGestor(await bloquearAtor(tx, ator.id));
      return executarUmaVez(
        tx,
        ator.id,
        d.operacaoId,
        "convidar",
        null,
        d,
        async () => {
          if (
            (await tx.query("SELECT 1 FROM membros WHERE id=$1", [usuarioId]))
              .rowCount
          )
            throw new ErroDominio(
              "CONFLITO",
              "Este e-mail já faz parte da equipe.",
            );
          await tx.query(
            "INSERT INTO membros(id,perfil,estado) VALUES($1,$2,'convidado')",
            [usuarioId, d.perfil],
          );
          await tx.query(
            "INSERT INTO historico(autor_id,entidade_id,acao) VALUES($1,$2,'convite')",
            [ator.id, usuarioId],
          );
          return {
            resultadoId: usuarioId,
            versao: 1,
            valor: await membroPorId(tx, usuarioId),
          };
        },
        (id) => membroPorId(tx, id),
      );
    });
    if (membro.estado === "convidado")
      await auth.api.requestPasswordReset({
        body: {
          email: d.email,
          redirectTo: process.env.APP_ORIGIN + "/definir-senha",
        },
      });
    return membro;
  } finally {
    await lock.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [
      "convite:" + d.email,
    ]);
    lock.release();
  }
}
