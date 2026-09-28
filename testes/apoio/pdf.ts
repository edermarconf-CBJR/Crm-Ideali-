import { PDFDocument } from "pdf-lib";
export async function pdfFicticio() {
  const p = await PDFDocument.create();
  p.addPage().drawText("Documento ficticio de teste");
  return p.save();
}
