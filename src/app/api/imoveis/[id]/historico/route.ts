import { executar, json } from "@/servidor/http";
import { listarHistorico } from "@/imoveis/consulta";
export async function GET(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) =>
    json(await listarHistorico(a, (await c.params).id)),
  );
}
