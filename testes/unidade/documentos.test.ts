import { test, expect } from "vitest";
import sharp from "sharp";
import { validarArquivo } from "../../src/arquivos/validacao";
test("documento em imagem preserva bytes e resolução originais", async () => {
  const bytes = await sharp({
    create: { width: 2700, height: 3000, channels: 3, background: "#eee" },
  })
    .png()
    .toBuffer();
  const r = await validarArquivo({
    categoria: "documento",
    nome: "documento.png",
    mimeInformado: "image/png",
    bytes,
  });
  expect(r.mime).toBe("image/png");
  expect(Buffer.from(r.bytes)).toEqual(bytes);
  expect((await sharp(r.bytes).metadata()).width).toBe(2700);
});
test("recusa cabeçalho PDF sem documento válido", async () => {
  await expect(
    validarArquivo({
      categoria: "documento",
      nome: "documento.pdf",
      mimeInformado: "application/pdf",
      bytes: Buffer.from("%PDF-isto nao e um documento PDF"),
    }),
  ).rejects.toMatchObject({ codigo: "INVALIDO" });
});
