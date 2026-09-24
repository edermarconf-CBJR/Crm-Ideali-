import "./copia-apoio";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
const { s3, bucket } = await import("../src/arquivos/s3");
const { banco } = await import("../src/servidor/banco");
if (process.env.CRM_MANUTENCAO !== "1")
  throw new Error("Pare a aplicação e confirme CRM_MANUTENCAO=1.");
const prefixo = new URL(process.env.DATABASE_URL!).pathname.endsWith("_teste")
  ? "testes/"
  : "imoveis/";
const vivos = new Set(
  (
    await banco.query("SELECT chave FROM arquivos WHERE removido_em IS NULL")
  ).rows.map((x) => x.chave),
);
let token: string | undefined;
let quantidade = 0;
const aplicar = process.argv.includes("--aplicar");
try {
  do {
    const lote = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket(),
        Prefix: prefixo,
        ContinuationToken: token,
      }),
    );
    for (const f of lote.Contents ?? []) {
      if (
        !f.Key ||
        !f.LastModified ||
        Date.now() - f.LastModified.getTime() < 86400000 ||
        vivos.has(f.Key)
      )
        continue;
      quantidade++;
      if (aplicar)
        await s3.send(
          new DeleteObjectCommand({ Bucket: bucket(), Key: f.Key }),
        );
    }
    token = lote.NextContinuationToken;
  } while (token);
  console.log(
    quantidade +
      " objetos sem referência há mais de 24 horas " +
      (aplicar ? "removidos." : "encontrados. Use --aplicar para remover."),
  );
} finally {
  await banco.end();
}
