export type Perfil = "gestor" | "corretor";
export type EstadoMembro = "convidado" | "ativo" | "inativo";
export type Situacao =
  "rascunho" | "disponivel" | "reservado" | "vendido" | "arquivado";
export type TipoImovel =
  "casa" | "apartamento" | "terreno" | "comercial" | "rural" | "outro";
export type Ator = { id: string; perfil: Perfil };
export type Membro = {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  estado: EstadoMembro;
  versao: number;
};
export type CamposImovel = {
  tipo: TipoImovel;
  cidade: string;
  bairro: string | null;
  titulo: string | null;
  descricao: string | null;
  precoCentavos: number | null;
  sobConsulta: boolean;
  quartos: number | null;
  banheiros: number | null;
  vagas: number | null;
  areaPrivativa: string | null;
  areaTotal: string | null;
  condominioCentavos: number | null;
  iptuAnualCentavos: number | null;
  caracteristicas: string[];
  estagioObra: string | null;
  entrega: string | null;
  condicoes: string | null;
};
export type DadosInternos = {
  endereco: string | null;
  proprietarioNome: string | null;
  proprietarioTelefone: string | null;
  chaves: string | null;
  observacoes: string | null;
};
export type ImovelBase = CamposImovel & {
  id: string;
  codigo: string;
  responsavelId: string;
  responsavelNome: string;
  situacao: Situacao;
  versao: number;
  capaId: string | null;
  atualizadoEm: string;
};
export type ImovelDetalhe = ImovelBase & {
  internos: DadosInternos | null;
  podeEditar: boolean;
  fotos: ArquivoResumo[];
  documentos: ArquivoResumo[];
};
export type ArquivoResumo = {
  id: string;
  nome: string;
  categoria: "foto" | "documento";
  mime: string;
  tamanho: number;
  ordem: number;
};
export type FiltroImoveis = {
  busca?: string;
  cidade?: string;
  bairro?: string;
  tipo?: TipoImovel;
  situacao?: Situacao;
  responsavelId?: string;
  pagina: number;
};
export type Pagina<T> = { itens: T[]; pagina: number; total: number };
export type CriarImovel = {
  operacaoId: string;
  tipo: TipoImovel;
  cidade: string;
  responsavelId?: string;
};
export type SalvarImovel = {
  operacaoId: string;
  versao: number;
  campos: CamposImovel;
  internos: DadosInternos;
};
export type TrocarSituacao = {
  operacaoId: string;
  versao: number;
  situacao: Situacao;
};
export type TransferirImovel = {
  operacaoId: string;
  versao: number;
  destinoId: string;
};
export type DesativarMembro = {
  operacaoId: string;
  versao: number;
  destinoId?: string;
};
export type AlterarPerfil = {
  operacaoId: string;
  versao: number;
  perfil: Perfil;
};
export type AdicionarArquivo = {
  operacaoId: string;
  versao: number;
  categoria: "foto" | "documento";
  nome: string;
  mimeInformado: string;
  bytes: Uint8Array;
};
export type OrganizarFotos = {
  operacaoId: string;
  versao: number;
  idsOrdenados: string[];
  capaId: string | null;
};
export type Historico = {
  id: string;
  autorNome: string;
  acao: string;
  data: string;
  camposAlterados: string[];
  anteriorId: string | null;
  novoId: string | null;
};
export type Falha = {
  codigo:
    | "NAO_AUTENTICADO"
    | "PROIBIDO"
    | "NAO_ENCONTRADO"
    | "INVALIDO"
    | "CONFLITO"
    | "ULTIMO_GESTOR"
    | "LIMITE"
    | "TEMPORARIO";
  mensagem: string;
  campos?: Record<string, string>;
};
