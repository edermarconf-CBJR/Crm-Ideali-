import "server-only";
import { exigirAtor } from "../acesso/ator";
import { ErroDominio } from "../compartilhado/erros";
import { ZodError } from "zod";
import type { Ator } from "../compartilhado/contratos";
export const json = (v: unknown, status = 200) =>
  Response.json(v, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export async function executar(
  req: Request,
  f: (a: Ator) => Promise<Response>,
) {
  try {
    if (
      !["GET", "HEAD"].includes(req.method) &&
      req.headers.get("origin") !== process.env.APP_ORIGIN
    )
      throw new ErroDominio("PROIBIDO", "Origem não permitida.");
    return await f(await exigirAtor(req.headers));
  } catch (e) {
    if (e instanceof ZodError)
      return json(
        {
          erro: {
            codigo: "INVALIDO",
            mensagem: "Confira os campos informados.",
            campos: Object.fromEntries(
              e.issues.map((i) => [i.path.join("."), i.message]),
            ),
          },
        },
        422,
      );
    if (e instanceof ErroDominio) {
      const c: Record<string, number> = {
        NAO_AUTENTICADO: 401,
        PROIBIDO: 403,
        NAO_ENCONTRADO: 404,
        INVALIDO: 422,
        CONFLITO: 409,
        ULTIMO_GESTOR: 409,
        LIMITE: 413,
        TEMPORARIO: 503,
      };
      return json(
        { erro: { codigo: e.codigo, mensagem: e.message, campos: e.campos } },
        c[e.codigo] ?? 400,
      );
    }
    console.error("Operação falhou:", e instanceof Error ? e.name : "Erro");
    return json(
      {
        erro: {
          codigo: "TEMPORARIO",
          mensagem: "Não foi possível concluir. Tente novamente.",
        },
      },
      503,
    );
  }
}
