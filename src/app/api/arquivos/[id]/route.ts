import { lerJson } from "@/servidor/corpo";
import { executar, json } from "@/servidor/http";
import { lerArquivo, removerArquivo } from "@/arquivos/servico";
export async function GET(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) => {
    const f = await lerArquivo(a, (await c.params).id);
    return new Response(new Uint8Array(f.bytes), {
      headers: {
        "Content-Type": f.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition":
          (f.categoria === "documento" ? "attachment" : "inline") +
          "; filename*=UTF-8''" +
          encodeURIComponent(f.nome),
      },
    });
  });
}
export async function DELETE(
  req: Request,
  c: { params: Promise<{ id: string }> },
) {
  return executar(req, async (a) =>
    json(await removerArquivo(a, (await c.params).id, await lerJson(req))),
  );
}
