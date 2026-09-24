import { lerJson } from "@/servidor/corpo";
import { executar, json } from "@/servidor/http";
import { alterarPerfil } from "@/equipe/servico";
export async function POST(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) =>
    json(await alterarPerfil(a, (await c.params).id, await lerJson(req))),
  );
}
