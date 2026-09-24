import "server-only";
import { createHash } from "node:crypto";
import type { Tx } from "./banco";
import { ErroDominio } from "../compartilhado/erros";
function canonico(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonico);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, x]) => [k, canonico(x)]),
    );
  return v;
}
export async function executarUmaVez<T>(
  tx: Tx,
  atorId: string,
  operacaoId: string,
  tipo: string,
  alvo: string | null,
  corpo: unknown,
  gravar: () => Promise<{ resultadoId: string; versao: number; valor: T }>,
  reler: (id: string) => Promise<T>,
): Promise<T> {
  await tx.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    atorId + operacaoId,
  ]);
  const hash = createHash("sha256")
    .update(JSON.stringify(canonico({ tipo, alvo, corpo })))
    .digest("hex");
  const anterior = (
    await tx.query(
      "SELECT hash,resultado_id FROM operacoes WHERE ator_id=$1 AND operacao_id=$2",
      [atorId, operacaoId],
    )
  ).rows[0];
  if (anterior) {
    if (anterior.hash !== hash)
      throw new ErroDominio(
        "CONFLITO",
        "Esta tentativa tem conteúdo diferente. Revise e envie novamente.",
      );
    return reler(anterior.resultado_id);
  }
  const r = await gravar();
  await tx.query(
    "INSERT INTO operacoes(ator_id,operacao_id,tipo,alvo,hash,resultado_id,versao) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [atorId, operacaoId, tipo, alvo, hash, r.resultadoId, r.versao],
  );
  return r.valor;
}
