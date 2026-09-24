import { lerJson } from "@/servidor/corpo";
import { executar, json } from "@/servidor/http";
import { obterImovel } from "@/imoveis/consulta";
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) =>
    json(await obterImovel(a, (await c.params).id)),
  );
}
import { salvarImovel } from "@/imoveis/gravacao";
export async function PATCH(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) =>
    json(await salvarImovel(a, (await c.params).id, await lerJson(req))),
  );
}
