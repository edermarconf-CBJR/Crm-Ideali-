import "server-only";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { banco, transacao } from "../servidor/banco";
import { bloquearAtor } from "../acesso/ator";
import { executarUmaVez } from "../servidor/operacoes";
import { bloquearImovel, registrar } from "../imoveis/gravacao";
import { obterImovel } from "../imoveis/consulta";
import { ErroDominio } from "../compartilhado/erros";
import type {
  Ator,
  AdicionarArquivo,
  OrganizarFotos,
} from "../compartilhado/contratos";
import { validarArquivo } from "./validacao";
import { armazenamento } from "./s3";
const base = z.object({
  operacaoId: z.uuid(),
  versao: z.number().int().positive(),
});
export async function adicionarArquivo(
  ator: Ator,
  id: string,
  d: AdicionarArquivo,
) {
  base
    .extend({
      categoria: z.enum(["foto", "documento"]),
      nome: z.string().min(1).max(255),
    })
    .parse(d);
  const arquivo = await validarArquivo(d);
  const hash = createHash("sha256").update(d.bytes).digest("hex");
  // Resultado desconhecido de COMMIT não autoriza excluir o objeto.
  // A manutenção remove somente órfãos antigos depois de consultar as referências.
  return transacao(async (tx) => {
    const a = await bloquearAtor(tx, ator.id);
    return executarUmaVez(
      tx,
      a.id,
      d.operacaoId,
      "arquivo",
      id,
      { ...d, bytes: undefined, hash },
      async () => {
        await bloquearImovel(tx, a, id, d.versao);
        const n = Number(
          (
            await tx.query(
              "SELECT count(*) FROM arquivos WHERE imovel_id=$1 AND categoria=$2 AND removido_em IS NULL",
              [id, d.categoria],
            )
          ).rows[0].count,
        );
        if (n >= (d.categoria === "foto" ? 40 : 20))
          throw new ErroDominio(
            "LIMITE",
            "O imóvel atingiu o limite de arquivos.",
          );
        const arquivoId = randomUUID();
        const chave =
          (process.env.DATABASE_URL?.includes("_teste")
            ? "testes/"
            : "imoveis/") +
          id +
          "/" +
          arquivoId;
        await armazenamento.colocar(chave, arquivo.bytes, arquivo.mime);
        await tx.query(
          "INSERT INTO arquivos(id,imovel_id,categoria,chave,nome,mime,tamanho,ordem,hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
          [
            arquivoId,
            id,
            d.categoria,
            chave,
            arquivo.nome,
            arquivo.mime,
            arquivo.bytes.length,
            n,
            hash,
          ],
        );
        await tx.query(
          "UPDATE imoveis SET versao=versao+1,atualizado_em=now(),capa_id=CASE WHEN capa_id IS NULL AND $2='foto' THEN $3::uuid ELSE capa_id END WHERE id=$1",
          [id, d.categoria, arquivoId],
        );
        await registrar(tx, a, id, "arquivo adicionado", [d.categoria]);
        const valor = await obterImovel(a, id, tx);
        return { resultadoId: id, versao: valor.versao, valor };
      },
      (id) => obterImovel(a, id, tx),
    );
  });
}
export async function organizarFotos(
  ator: Ator,
  id: string,
  d: OrganizarFotos,
) {
  base
    .extend({
      idsOrdenados: z.array(z.uuid()).max(40),
      capaId: z.uuid().nullable(),
    })
    .parse(d);
  return transacao(async (tx) => {
    const a = await bloquearAtor(tx, ator.id);
    return executarUmaVez(
      tx,
      a.id,
      d.operacaoId,
      "ordenar-fotos",
      id,
      d,
      async () => {
        const i = await bloquearImovel(tx, a, id, d.versao);
        const ids = new Set(d.idsOrdenados);
        if (
          ids.size !== d.idsOrdenados.length ||
          ids.size !== i.fotos.length ||
          i.fotos.some((f) => !ids.has(f.id)) ||
          (d.capaId !== null && !ids.has(d.capaId))
        )
          throw new ErroDominio(
            "INVALIDO",
            "Confira a ordem e a capa das fotos.",
          );
        for (const [ordem, foto] of d.idsOrdenados.entries())
          await tx.query(
            "UPDATE arquivos SET ordem=$1 WHERE id=$2 AND imovel_id=$3",
            [ordem, foto, id],
          );
        await tx.query(
          "UPDATE imoveis SET capa_id=$1,versao=versao+1,atualizado_em=now() WHERE id=$2",
          [d.capaId, id],
        );
        await registrar(tx, a, id, "fotos organizadas");
        const valor = await obterImovel(a, id, tx);
        return { resultadoId: id, versao: valor.versao, valor };
      },
      (id) => obterImovel(a, id, tx),
    );
  });
}
export async function lerArquivo(a: Ator, id: string) {
  if (!z.uuid().safeParse(id).success)
    throw new ErroDominio("NAO_ENCONTRADO", "Arquivo não encontrado.");
  const f = (
    await banco.query(
      "SELECT imovel_id,categoria,chave,nome,mime FROM arquivos WHERE id=$1 AND removido_em IS NULL",
      [id],
    )
  ).rows[0];
  if (!f) throw new ErroDominio("NAO_ENCONTRADO", "Arquivo não encontrado.");
  const i = await obterImovel(a, f.imovel_id);
  if (f.categoria === "documento" && !i.podeEditar)
    throw new ErroDominio("NAO_ENCONTRADO", "Arquivo não encontrado.");
  const r = await armazenamento.obter(f.chave);
  return { ...r, nome: f.nome, categoria: f.categoria as "foto" | "documento" };
}
export async function removerArquivo(
  ator: Ator,
  id: string,
  d: { operacaoId: string; versao: number },
) {
  base.parse(d);
  z.uuid().parse(id);
  return transacao(async (tx) => {
    const a = await bloquearAtor(tx, ator.id);
    return executarUmaVez(
      tx,
      a.id,
      d.operacaoId,
      "remover-arquivo",
      id,
      d,
      async () => {
        const f = (
          await tx.query(
            "SELECT imovel_id FROM arquivos WHERE id=$1 AND removido_em IS NULL",
            [id],
          )
        ).rows[0];
        if (!f)
          throw new ErroDominio("NAO_ENCONTRADO", "Arquivo não encontrado.");
        await bloquearImovel(tx, a, f.imovel_id, d.versao);
        await tx.query("UPDATE arquivos SET removido_em=now() WHERE id=$1", [
          id,
        ]);
        await tx.query(
          "UPDATE imoveis SET capa_id=CASE WHEN capa_id=$2::uuid THEN (SELECT id FROM arquivos WHERE imovel_id=$1 AND categoria='foto' AND removido_em IS NULL ORDER BY ordem,id LIMIT 1) ELSE capa_id END,versao=versao+1,atualizado_em=now() WHERE id=$1",
          [f.imovel_id, id],
        );
        await registrar(tx, a, f.imovel_id, "arquivo removido");
        const valor = await obterImovel(a, f.imovel_id, tx);
        return { resultadoId: f.imovel_id, versao: valor.versao, valor };
      },
      (id) => obterImovel(a, id, tx),
    );
  });
}
