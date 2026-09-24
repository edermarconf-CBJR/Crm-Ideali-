export const tiposTexto: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
  rural: "Rural",
  outro: "Outro",
};
export const situacoesTexto: Record<string, string> = {
  rascunho: "Rascunho",
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  arquivado: "Arquivado",
};
export const preco = (valor: number | null, sobConsulta = false) =>
  sobConsulta
    ? "Sob consulta"
    : valor === null
      ? "Preço não informado"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(valor / 100);
