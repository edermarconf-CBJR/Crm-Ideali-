import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { ErroDominio } from "../compartilhado/erros";
import type { AdicionarArquivo } from "../compartilhado/contratos";
export async function validarArquivo(
  d: Pick<AdicionarArquivo, "categoria" | "nome" | "mimeInformado" | "bytes">,
) {
  const limite = (d.categoria === "foto" ? 15 : 20) * 1024 * 1024;
  if (d.bytes.length === 0)
    throw new ErroDominio("INVALIDO", "O arquivo está vazio.");
  if (d.bytes.length > limite)
    throw new ErroDominio(
      "LIMITE",
      "O arquivo ultrapassa o tamanho permitido.",
    );
  const nome =
    d.nome.replace(/[\r\n<>:"/\\|?*\x00-\x1f]/g, "").slice(0, 160) || "arquivo";
  try {
    if (
      d.categoria === "documento" &&
      Buffer.from(d.bytes.subarray(0, 5)).toString() === "%PDF-"
    ) {
      const pdf = await PDFDocument.load(d.bytes, {
        ignoreEncryption: false,
        throwOnInvalidObject: true,
      });
      if (pdf.getPageCount() < 1) throw new Error("PDF sem páginas");
      return {
        bytes: d.bytes,
        mime: "application/pdf",
        nome: nome.replace(/\.[^.]+$/, "") + ".pdf",
      };
    }
    const imagem = sharp(d.bytes, {
      limitInputPixels: 50000000,
      failOn: "warning",
    });
    const meta = await imagem.metadata();
    if (
      !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
      (d.categoria === "documento" && meta.format === "webp")
    )
      throw new Error("Formato");
    if (d.categoria === "documento") {
      // Decodifica integralmente para validar; o arquivo privado original não é alterado.
      await imagem.stats();
      return {
        bytes: d.bytes,
        mime: meta.format === "png" ? "image/png" : "image/jpeg",
        nome:
          nome.replace(/\.[^.]+$/, "") +
          (meta.format === "png" ? ".png" : ".jpg"),
      };
    }
    const bytes = await imagem
      .rotate()
      .resize({
        width: 2560,
        height: 2560,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    return {
      bytes,
      mime: "image/jpeg",
      nome: nome.replace(/\.[^.]+$/, "") + ".jpg",
    };
  } catch {
    throw new ErroDominio(
      "INVALIDO",
      "Arquivo inválido ou protegido por senha. Use JPG, PNG ou WebP para fotos; PDF, JPG ou PNG para documentos.",
    );
  }
}
