import type {
  CamposImovel,
  DadosInternos,
  TipoImovel,
} from "../compartilhado/contratos";
export const internosVazios: DadosInternos = {
  endereco: null,
  proprietarioNome: null,
  proprietarioTelefone: null,
  chaves: null,
  observacoes: null,
};
export function camposIniciais(tipo: TipoImovel, cidade: string): CamposImovel {
  return {
    tipo,
    cidade,
    bairro: null,
    titulo: null,
    descricao: null,
    precoCentavos: null,
    sobConsulta: false,
    quartos: null,
    banheiros: null,
    vagas: null,
    areaPrivativa: null,
    areaTotal: null,
    condominioCentavos: null,
    iptuAnualCentavos: null,
    caracteristicas: [],
    estagioObra: null,
    entrega: null,
    condicoes: null,
  };
}
