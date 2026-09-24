import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});
export const bucket = () => process.env.S3_BUCKET!;
export const armazenamento = {
  async colocar(chave: string, bytes: Uint8Array, mime: string) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: chave,
        Body: bytes,
        ContentType: mime,
      }),
    );
  },
  async obter(chave: string) {
    const r = await s3.send(
      new GetObjectCommand({ Bucket: bucket(), Key: chave }),
    );
    if (!r.Body) throw new Error("Objeto ausente");
    return {
      bytes: await r.Body.transformToByteArray(),
      mime: r.ContentType ?? "application/octet-stream",
    };
  },
  async remover(chave: string) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: chave }));
  },
};
