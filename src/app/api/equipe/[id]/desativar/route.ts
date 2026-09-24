import { lerJson } from "@/servidor/corpo";
import { executar, json } from "@/servidor/http";
import { desativarMembro } from "@/equipe/servico";
export async function POST(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) =>
    json(await desativarMembro(a, (await c.params).id, await lerJson(req))),
  );
}
