import type {Ator,ImovelBase} from '../compartilhado/contratos';
export function podeEditar(a:Ator,i:ImovelBase){return a.perfil==='gestor'||i.responsavelId===a.id}
export function podeConsultar(a:Ator,i:ImovelBase){return podeEditar(a,i)||['disponivel','reservado'].includes(i.situacao)}