import { z } from "zod";
import { ErroDominio } from "../compartilhado/erros";
const texto = (max: number) => z.string().trim().max(max).nullable();
const inteiro = z.number().int().min(0).max(999).nullable();
const dinheiro = z.number().int().min(0).max(100000000000).nullable();
const area = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/)
  .refine((x) => Number(x) > 0 && Number(x) <= 1000000000)
  .nullable();
export const tipos = z.enum([
  "casa",
  "apartamento",
  "terreno",
  "comercial",
  "rural",
  "outro",
]);
export const situacoes = z.enum([
  "rascunho",
  "disponivel",
  "reservado",
  "vendido",
  "arquivado",
]);
export const novoSchema = z
  .object({
    operacaoId: z.uuid(),
    tipo: tipos,
    cidade: z.string().trim().min(2).max(120),
    responsavelId: z.string().min(1).max(100).optional(),
  })
  .strict();
export const camposSchema = z
  .object({
    tipo: tipos,
    cidade: z.string().trim().min(2).max(120),
    bairro: texto(120),
    titulo: texto(160),
    descricao: texto(10000),
    precoCentavos: dinheiro.refine((x) => x === null || x > 0),
    sobConsulta: z.boolean(),
    quartos: inteiro,
    banheiros: inteiro,
    vagas: inteiro,
    areaPrivativa: area,
    areaTotal: area,
    condominioCentavos: dinheiro,
    iptuAnualCentavos: dinheiro,
    caracteristicas: z.array(z.string().trim().min(1).max(80)).max(50),
    estagioObra: texto(120),
    entrega: texto(120),
    condicoes: texto(3000),
  })
  .strict();
export const internosSchema = z
  .object({
    endereco: texto(500),
    proprietarioNome: texto(120),
    proprietarioTelefone: texto(40),
    chaves: texto(1500),
    observacoes: texto(10000),
  })
  .strict();
export const salvarSchema = z
  .object({
    operacaoId: z.uuid(),
    versao: z.number().int().positive(),
    campos: camposSchema,
    internos: internosSchema,
  })
  .strict();
export const situacaoSchema = z
  .object({
    operacaoId: z.uuid(),
    versao: z.number().int().positive(),
    situacao: situacoes,
  })
  .strict();
export function moedaParaCentavos(texto: string): number | null {
  const v = texto.trim();
  if (!v) return null;
  if (!/^(\d+|\d{1,3}(\.\d{3})+)(,\d{1,2})?$/.test(v))
    throw new ErroDominio("INVALIDO", "Informe um valor como 1.250,00.");
  const [reais, centavos = ""] = v.replaceAll(".", "").split(",");
  const total = Number(reais) * 100 + Number(centavos.padEnd(2, "0"));
  if (!Number.isSafeInteger(total) || total > 100000000000)
    throw new ErroDominio("INVALIDO", "Valor acima do limite.");
  return total;
}
