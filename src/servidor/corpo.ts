import { ErroDominio } from "../compartilhado/erros";
export async function lerJson<T = unknown>(req: Request): Promise<T> {
  const leitor = req.body?.getReader();
  if (!leitor)
    throw new ErroDominio("INVALIDO", "Envie os campos do formulário.");
  const partes: Uint8Array[] = [];
  let tamanho = 0;
  try {
    while (true) {
      const r = await leitor.read();
      if (r.done) break;
      tamanho += r.value.byteLength;
      if (tamanho > 131072) {
        await leitor.cancel();
        throw new ErroDominio(
          "LIMITE",
          "O formulário ultrapassou o limite de tamanho.",
        );
      }
      partes.push(r.value);
    }
  } finally {
    leitor.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(partes).toString("utf8"));
  } catch {
    throw new ErroDominio(
      "INVALIDO",
      "Não foi possível ler o formulário. Confira os campos e tente novamente.",
    );
  }
}
