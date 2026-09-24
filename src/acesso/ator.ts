import "server-only";
import { auth } from "./auth";
import { banco, type Tx } from "../servidor/banco";
import { ErroDominio } from "../compartilhado/erros";
import type { Ator } from "../compartilhado/contratos";
export async function exigirAtor(headers: Headers): Promise<Ator> {
  const s = await auth.api.getSession({ headers });
  if (!s) throw new ErroDominio("NAO_AUTENTICADO", "Entre para continuar.");
  const r = await banco.query(
    "SELECT id,perfil FROM membros WHERE id=$1 AND estado='ativo'",
    [s.user.id],
  );
  if (!r.rows[0])
    throw new ErroDominio("NAO_AUTENTICADO", "Este acesso está inativo.");
  return r.rows[0];
}
export async function bloquearAtor(tx: Tx, id: string): Promise<Ator> {
  const r = await tx.query(
    "SELECT id,perfil FROM membros WHERE id=$1 AND estado='ativo' FOR SHARE",
    [id],
  );
  if (!r.rows[0])
    throw new ErroDominio("NAO_AUTENTICADO", "Este acesso está inativo.");
  return r.rows[0];
}
export function exigirGestor(a: Ator) {
  if (a.perfil !== "gestor")
    throw new ErroDominio(
      "PROIBIDO",
      "Esta ação está disponível para gestores.",
    );
}
