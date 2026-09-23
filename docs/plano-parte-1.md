# CRM Ideali — plano de implementação da Parte 1

> **Para execução por agentes:** usar `superpowers:subagent-driven-development` ou `superpowers:executing-plans`, conforme o método escolhido pelo usuário. Executar tarefa por tarefa e acompanhar os passos pelas caixas de seleção.

**Objetivo:** entregar uma versão de avaliação com contas individuais, gestão de equipe e catálogo interno de imóveis, utilizável no celular e no computador.

**Arquitetura:** aplicação web com servidor próprio, PostgreSQL central e armazenamento privado de arquivos. O servidor verifica a identidade e a permissão em cada operação; os dados internos nunca dependem apenas de controles visuais. O futuro site usará uma versão publicada dos anúncios, separada deste catálogo.

**Tecnologias propostas:** TypeScript, Next.js/React, Node.js, PostgreSQL, Better Auth, SQL parametrizado com `pg`, Zod, Sharp, armazenamento compatível com S3; Vitest e Playwright para verificação. Ambiente local com PostgreSQL, MinIO e Mailpit em contêineres.

**Especificação:** [Proposta da primeira versão do CRM Ideali](Proposta%20da%20primeira%20vers%C3%A3o%20do%20CRM%20Ideali.md), aprovada em 23/09/2026.

**Estado deste plano:** concluído para revisão; nenhuma tarefa de implementação executada. A aprovação da proposta autorizou este planejamento. O orçamento e a contratação de infraestrutura não estão autorizados por este documento.

## O que Eder poderá experimentar ao final

- Entrar com uma conta individual e recuperar o acesso.
- Cadastrar mais integrantes, escolher Gestor ou Corretor e transferir responsabilidades.
- Encontrar imóveis por código, cidade, bairro, tipo, responsável e situação.
- Salvar um rascunho preenchendo apenas tipo e cidade; completar o cadastro em três partes.
- Adicionar fotos, ordenar, escolher a capa e guardar documentos internos.
- Trabalhar em telas pequenas com rótulos claros e salvar sem perder os campos quando ocorrer uma falha.

Esta entrega abre diretamente em **Imóveis**. Gestores também veem **Equipe**. Hoje, Clientes, Agenda e publicação entram nas partes seguintes; não haverá menus sem função simulando essas entregas.

## Restrições globais da especificação

As transcrições abaixo valem para todas as tarefas:

- “Dois perfis iniciais: **Gestor** e **Corretor**. Cada integrante tem uma conta própria.”
- “A quantidade inicial de 11 pessoas não será um limite fixo no cadastro de usuários.”
- “Para salvar um rascunho bastam tipo e cidade.”
- “As restrições valem também nas consultas e gravações do servidor, nos resultados de busca e nos anexos; esconder botões não é suficiente.”
- “Se duas pessoas editarem o mesmo registro, o sistema detecta a versão desatualizada e pede revisão antes de substituir o que foi salvo por outra pessoa.”
- “O sistema só mostra sucesso depois de confirmar a gravação.”
- “Em falha de rede, preserva o que está sendo digitado enquanto a tela permanecer aberta e oferece nova tentativa.”
- “Login usa contas individuais e recuperação de acesso; não haverá cadastro público de corretores.”
- “Documentos privados exigem autorização para acesso, e backups deverão ter restauração verificada antes de dados reais entrarem em produção.”
- “As telas principais devem funcionar em uma coluna sem rolagem horizontal a partir de 320 pixels CSS.”

Conversa, interface, documentação própria e commits em português do Brasil. Identificadores exigidos por bibliotecas seguem suas APIs. Não copiar código, dados ou regras financeiras do CRM Marte. Não alterar Praedium, site atual, DNS ou contratos de serviço durante esta entrega.

## Foco de revisão

| Condição de risco | Comportamento exigido | Verificação responsável |
|---|---|---|
| Corretor adivinha identificador, busca dado interno ou reutiliza URL de arquivo | Nenhuma resposta revela proprietário, documentos ou rascunho alheio | Tarefas 3 e 5 |
| Duas desativações ou rebaixamentos simultâneos | Sempre permanece ao menos um gestor ativo; transferência e revogação são atômicas | Tarefa 6 |
| Usuário perde acesso enquanto tem sessão ou formulário aberto | Próximo pedido é negado, inclusive gravação e arquivo; recuperação não reativa conta | Tarefas 2 e 6 |
| Reenvio após queda de rede, edição concorrente ou upload interrompido | Sem duplicação da mesma operação, sem sobrescrita silenciosa e sem sucesso falso | Tarefas 4, 5 e 7 |
| Foto inválida, documento disfarçado, valor vazio ou tela de 320 px | Erro compreensível, dado preservado e nenhuma exposição ou conversão de vazio para zero | Tarefas 4, 5 e 7 |

## Decisões técnicas para esta construção

### Execução e hospedagem

Desenvolver em um projeto novo: `C:\Users\Ideali Imoveis\Documents\Codex\2026-09-23\q\work\crm-ideali`. O diretório atual não é um repositório Git. Na execução, inspecionar novamente; se o subdiretório continuar vazio, inicializar ali um repositório próprio, sem modificar projetos vizinhos. Todos os caminhos de código abaixo são relativos a esse projeto futuro.

Adotar Node 24 LTS, Next 16, React 19 e PostgreSQL 17. Na inicialização, consultar as versões publicadas e fixar os patches compatíveis no `package-lock.json`; os testes rodam com esse arquivo, não com dependências flutuantes. Não copiar versões de outro CRM. O Node portátil registrado no computador requer nova verificação de acesso; a verificação sem elevação encontrou restrição de leitura nesta sessão.

Para avaliação inicial, usar infraestrutura local descartável, com dados fictícios: PostgreSQL para dados, MinIO para objetos privados e Mailpit para mensagens de acesso. A instalação de Docker não foi constatada. A tarefa 1 começa pela verificação desse pré-requisito; não instala virtualização ou reinicia o computador silenciosamente. Se indisponível, preparar a aplicação e registrar a execução integrada como pendente de um ambiente com Docker, sem substituir os testes por resultados simulados.

Para o piloto hospedado, a arquitetura proposta é um serviço Node em contêiner, PostgreSQL gerenciado, armazenamento privado compatível com S3 e envio SMTP. A contratação e o fornecedor comercial serão decididos com cotações e condições reais na preparação do piloto. Esta Parte 1 não depende de contratar esses serviços, nem promete economia antes dessa comparação. Next admite execução em servidor Node; a preparação para hospedagem deve seguir sua [documentação oficial](https://nextjs.org/docs/app/guides/self-hosting).

A habilidade Sites foi avaliada. Sua orientação atual oferece identidade da plataforma/entrada com ChatGPT e exige confirmar o caminho para autenticação própria ou externa. Para não transformar uma conta ChatGPT em requisito da equipe sem uma escolha do Eder, este plano propõe aplicação independente, sem usar o starter de Sites ou contornar sua autenticação. Isso é uma escolha técnica proposta neste plano, não uma afirmação de impossibilidade geral da plataforma.

### Limites desta parte

Documentos privados entram junto com as fotos para que a fronteira de acesso do cadastro já seja verificável. Publicação, prévia pública, snapshots de anúncio e retirada pública ficam integralmente na Parte 2. Aqui nenhuma situação comercial gera URL pública. Na Parte 2, toda mudança para situação diferente de disponível deverá retirar a oferta na mesma transação.

A desativação nesta parte transfere imóveis. Antes de entregar Clientes e Agenda na Parte 3, a mesma operação deverá ser ampliada para seus vínculos; não criar tabelas vazias ou transferências fictícias agora. Manter o histórico de autoria, inclusive de integrantes inativos.

### Tipos e contratos comuns

Criar `src/compartilhado/contratos.ts`. JSON usa datas ISO e inteiros em centavos. Valores decimais de área trafegam como texto com ponto; a interface converte a entrada brasileira. Campos desconhecidos são `null`.

```ts
export type Perfil = 'gestor' | 'corretor';
export type EstadoMembro = 'convidado' | 'ativo' | 'inativo';
export type Situacao = 'rascunho' | 'disponivel' | 'reservado' | 'vendido' | 'arquivado';
export type TipoImovel = 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'rural' | 'outro';
export type Ator = { id: string; perfil: Perfil };
export type Membro = { id: string; nome: string; email: string; perfil: Perfil;
  estado: EstadoMembro; versao: number };
export type CamposImovel = {
  tipo: TipoImovel; cidade: string; bairro: string | null;
  titulo: string | null; descricao: string | null;
  precoCentavos: number | null; sobConsulta: boolean;
  quartos: number | null; banheiros: number | null; vagas: number | null;
  areaPrivativa: string | null; areaTotal: string | null;
  condominioCentavos: number | null; iptuAnualCentavos: number | null;
  caracteristicas: string[]; estagioObra: string | null;
  entrega: string | null; condicoes: string | null;
};
export type DadosInternos = { endereco: string | null; proprietarioNome: string | null;
  proprietarioTelefone: string | null; chaves: string | null; observacoes: string | null };
export type ImovelBase = CamposImovel & { id: string; codigo: string;
  responsavelId: string; situacao: Situacao; versao: number;
  capaId: string | null; atualizadoEm: string };
export type ImovelDetalhe = ImovelBase & { internos: DadosInternos | null;
  podeEditar: boolean; fotos: ArquivoResumo[]; documentos: ArquivoResumo[] };
export type ArquivoResumo = { id: string; nome: string; categoria: 'foto' | 'documento';
  mime: string; tamanho: number; ordem: number };
export type FiltroImoveis = { busca?: string; cidade?: string; bairro?: string;
  tipo?: TipoImovel; situacao?: Situacao; responsavelId?: string; pagina: number };
export type Pagina<T> = { itens: T[]; pagina: number; total: number };
export type CriarImovel = { operacaoId: string; tipo: TipoImovel; cidade: string;
  responsavelId?: string };
export type SalvarImovel = { operacaoId: string; versao: number;
  campos: CamposImovel; internos: DadosInternos };
export type TrocarSituacao = { operacaoId: string; versao: number; situacao: Situacao };
export type TransferirImovel = { operacaoId: string; versao: number; destinoId: string };
export type DesativarMembro = { operacaoId: string; versao: number; destinoId?: string };
export type AlterarPerfil = { operacaoId: string; versao: number; perfil: Perfil };
export type AdicionarArquivo = { operacaoId: string; versao: number;
  categoria: 'foto' | 'documento'; nome: string; mimeInformado: string; bytes: Uint8Array };
export type OrganizarFotos = { operacaoId: string; versao: number;
  idsOrdenados: string[]; capaId: string | null };
export type Historico = { id: string; autorNome: string; acao: string; data: string;
  camposAlterados: string[]; anteriorId: string | null; novoId: string | null };
export type Falha = { codigo: 'NAO_AUTENTICADO' | 'PROIBIDO' | 'NAO_ENCONTRADO' |
  'INVALIDO' | 'CONFLITO' | 'ULTIMO_GESTOR' | 'LIMITE' | 'TEMPORARIO';
  mensagem: string; campos?: Record<string, string> };
```

`id` é opaco; validar UUIDs das entidades próprias. IDs de usuário da biblioteca são texto opaco. `operacaoId` é UUID novo para cada intenção de gravação, mantido nas tentativas de reenvio. Se o usuário alterar o conteúdo após uma falha, gerar outro. Na mesma intenção, corpo diferente com a mesma chave retorna 409.

Respostas de sucesso usam o objeto indicado pelo contrato. Falhas usam `{ erro: Falha }`: 401 para ausência de sessão; 403 para ação gerencial negada; 404 para entidade inexistente ou invisível; 409 para versão/estado conflitante; 422 para campos inválidos; 413 para arquivo grande; 429 para limite de tentativas; 503 para indisponibilidade. Não enviar stack, SQL, token, chave do objeto ou detalhes internos na resposta.

`src/compartilhado/erros.ts` exporta a falha de domínio, sem dependência de HTTP:

```ts
import type { Falha } from './contratos';
export class ErroDominio extends Error {
  constructor(public codigo: Falha['codigo'], mensagem: string,
    public campos?: Record<string, string>) {
    super(mensagem);
    this.name = 'ErroDominio';
  }
}
```

### Persistência e concorrência

Tabelas de autenticação geradas pela versão fixada do Better Auth; tabelas de negócio em migrações SQL numeradas e imutáveis:

Divisão: `001-autenticacao.sql` contém o esquema gerado; `002-equipe.sql` contém membros, controle da equipe, histórico e recibos de operações; `003-imoveis.sql` contém catálogo e internos; `004-arquivos.sql` contém arquivos e vínculo de capa. Histórico e recibos já existem para convites na tarefa 2.

| Tabela | Colunas/restrições essenciais |
|---|---|
| `controle_equipe` | Uma linha `id = 1`, usada para serializar criação/mudança de perfil/desativação |
| `membros` | `id` FK usuário, perfil, estado, versão ≥ 1, timestamps; usuário nunca é apagado pela interface |
| `imoveis` | UUID, código único gerado por sequência `IDE-000001`, responsável FK, situação, versão, campos do contrato; valores não negativos, preço preenchido > 0 |
| `imoveis_internos` | FK única do imóvel, campos internos opcionais; nunca participar da busca compartilhada |
| `arquivos` | UUID, imóvel FK, categoria, chave aleatória única, MIME real, tamanho, ordem, hash, `removido_em` opcional |
| `historico` | Autor, entidade, ação, nomes de campos alterados, responsáveis anterior/novo, horário UTC; sem senha/token ou cópia de documentos |
| `operacoes` | PK `(ator_id, operacao_id)`, tipo/alvo, hash do corpo canônico, identificador do resultado, versão resultante; não guardar DTO privado completo |

CPF/documentação pessoal do proprietário não são campos obrigatórios. Não impor documento de cliente na fase de captação. Código nunca reutilizado, mesmo se houver lacunas na sequência.

Índices: imóveis `(responsavel_id, atualizado_em, id)` e `(situacao, atualizado_em, id)`; arquivos `(imovel_id, categoria, removido_em)`; histórico `(entidade_id, data, id)`. Paginação fixa em 30 com limite máximo validado no servidor e ordenação `atualizado_em DESC, id DESC`. Busca parametrizada por código, título, cidade e bairro; escapar `%` e `_` como literais. Medir antes de adicionar um serviço de busca.

Toda gravação de negócio: abrir transação → bloquear membro ativo do ator com `FOR SHARE` → verificar permissão atual → bloquear alvo necessário → comparar versão → gravar entidade, histórico e recibo da operação → confirmar. Criação/transferência também bloqueiam o destinatário ativo. Bloqueios de membros são tomados por ID ordenado. Gestão da equipe bloqueia primeiro `controle_equipe`, depois membros, depois imóveis. Ao obter esse bloqueio, revalidar inclusive o gestor autor.

Isso impede uma edição iniciada após a desativação ou uma atribuição para quem acabou de ser desativado. Consultas e downloads revalidam o membro a cada pedido; uma resposta já enviada não pode ser recolhida. Operações de equipe usam a linha sentinela para que a contagem de gestores não sofra corrida. A semântica de bloqueio deve ser validada em PostgreSQL real, conforme sua [documentação](https://www.postgresql.org/docs/17/explicit-locking.html).

## Mapa dos arquivos

| Caminho | Responsabilidade |
|---|---|
| `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` | Dependências fixadas, scripts e compilação |
| `.env.example`, `.gitignore`, `compose.yaml`, `Dockerfile`, `README.md` | Execução local reproduzível e limites do piloto |
| `scripts/migrar.ts`, `scripts/criar-primeiro-gestor.ts`, `scripts/testar-integracao.ts` | Migrações, ingresso inicial e execução isolada dos testes |
| `scripts/backup.ts`, `scripts/restaurar.ts` | Cópia e restauração em destino separado |
| `migracoes/001-autenticacao.sql` a `004-arquivos.sql` | Esquema versionado, sem dados reais |
| `src/compartilhado/contratos.ts`, `erros.ts`, `validacao.ts` | Tipos, falhas e validação reutilizável |
| `src/servidor/ambiente.ts`, `banco.ts`, `http.ts`, `operacoes.ts` | Configuração, conexão/transações, bordas HTTP, idempotência |
| `src/acesso/auth.ts`, `ator.ts`, `provisionar.ts`, `mensagens.ts` | Autenticação, autorização ativa, convite e recuperação |
| `src/equipe/servico.ts`, `repositorio.ts` | Listagem, perfil, transferência e desativação |
| `src/imoveis/politica.ts`, `consulta.ts`, `gravacao.ts`, `validacao.ts` | Catálogo, projeções, cadastro e conflitos |
| `src/arquivos/armazenamento.ts`, `s3.ts`, `servico.ts`, `validacao.ts` | Arquivos privados e processamento de imagem |
| `src/componentes/campo.tsx`, `aviso.tsx`, `dialogo.tsx`, `navegacao.tsx` | Elementos acessíveis compartilhados |
| `src/app/layout.tsx`, `globals.css`, `page.tsx` | Idioma, estilo e redirecionamento inicial |
| `src/app/entrar/page.tsx`, `recuperar-acesso/page.tsx`, `definir-senha/page.tsx` | Fluxos individuais de acesso |
| `src/app/(crm)/layout.tsx`, `imoveis/page.tsx`, `imoveis/novo/page.tsx` | Casca autenticada, catálogo e rascunho |
| `src/app/(crm)/imoveis/[id]/page.tsx`, `editor.tsx`, `fotos.tsx`, `documentos.tsx` | Ficha e edição progressiva |
| `src/app/(crm)/equipe/page.tsx`, `acoes.tsx` | Administração da equipe |
| `src/app/api/auth/[...all]/route.ts` | Gateway restrito para Better Auth |
| `src/app/api/equipe/route.ts`, `[id]/perfil/route.ts`, `[id]/desativar/route.ts` | Operações de equipe |
| `src/app/api/imoveis/route.ts`, `[id]/route.ts`, `[id]/situacao/route.ts`, `[id]/responsavel/route.ts`, `[id]/historico/route.ts` | Rotas do catálogo |
| `src/app/api/imoveis/[id]/arquivos/route.ts`, `[id]/fotos/route.ts` | Inclusão de arquivo, ordenação e capa |
| `src/app/api/arquivos/[id]/route.ts` | Download autorizado e remoção lógica |
| `testes/apoio/cenario.ts`, `testes/apoio/servidor.ts` | Dados fictícios e servidor real de teste |
| `testes/integracao/*.test.ts`, `testes/unidade/*.test.ts`, `testes/telas/*.spec.ts` | Testes detalhados nas tarefas |
| `vitest.config.ts`, `playwright.config.ts`, `docs/avaliacao-parte-1.md` | Execução e roteiro de avaliação |

Nas linhas com caminhos abreviados após uma vírgula, os arquivos compartilham o diretório do primeiro caminho. Rotas filhas com `[id]` pertencem ao prefixo de API da mesma linha. Arquivos de negócio começam com `import 'server-only'`; tipos compartilhados não importam servidor.

## Tarefa 1 — fundação executável e sessão protegida

**Arquivos:** criar configurações da raiz, scripts de migração/teste, migrações 001/002 (autenticação/equipe), contratos comuns, ambiente/banco/http, `acesso/auth.ts`, `acesso/ator.ts`, gateway auth e páginas de entrada/casca. Criar `testes/apoio/cenario.ts`, `testes/apoio/servidor.ts`, `testes/integracao/acesso.test.ts`.

**Interfaces:**

```ts
// src/servidor/banco.ts
import type { PoolClient } from 'pg';
export type Tx = PoolClient;
export function transacao<T>(trabalho: (tx: Tx) => Promise<T>): Promise<T>;
// src/acesso/ator.ts: resolve sessão e membro em toda chamada
export function exigirAtor(headers: Headers): Promise<Ator>;
export function bloquearAtor(tx: Tx, id: string): Promise<Ator>;
// src/servidor/http.ts: autenticação + origem nas escritas + falhas padronizadas
export function executar(req: Request,
  trabalho: (ator: Ator) => Promise<Response>): Promise<Response>;
// testes/apoio/cenario.ts
export type SessaoTeste = { id: string; cookie: string; email: string };
export type Cenario = { gestor: SessaoTeste; corretorA: SessaoTeste;
  corretorB: SessaoTeste; limpar(): Promise<void> };
export function criarCenario(): Promise<Cenario>;
export function api(ator: SessaoTeste | null, caminho: string,
  metodo?: string, corpo?: unknown): Promise<Response>;
```

O apoio de teste usa `TEST_DATABASE_URL` exclusiva, executa migrações em banco cujo nome termina `_teste`, cria três contas fictícias por `auth.api.createUser`, associa perfis via SQL e obtém cookies por login real. `limpar()` remove somente dados dessa base isolada. `api` usa `TEST_BASE_URL`, cabeçalho Cookie e Origin da base; define JSON quando há corpo. Nunca apontar testes para banco operacional.

Executar arquivos de integração em série (`fileParallelism: false`) e Playwright com um worker na primeira entrega; os testes de corrida abrem conexões simultâneas dentro de um único caso. Isso evita que a limpeza de uma fixture apague outra. Carregar o ambiente antes de importar módulos de configuração; scripts usam `process.loadEnvFile` seguido de importação dinâmica. Nos testes unitários, resolver `server-only` para o módulo vazio do pacote; nos scripts Node usar a condição apropriada `react-server`, sem remover a proteção do código de produção.

- [ ] Verificar Node/npm/Git/Docker, espaço e portas livres; preparar o subdiretório e Git local. Usar o caminho explícito do Node portátil quando necessário, sem reconfigurar o sistema inteiro. Fixar dependências compatíveis e criar scripts `dev`, `build`, `start`, `lint`, `typecheck`, `db:migrate`, `test:unidade`, `test:integracao`, `test:telas`.
- [ ] Configurar `compose.yaml` com PostgreSQL 17, MinIO e Mailpit; fixar os digests das imagens consultados na execução. Senhas locais aleatórias em `.env.local` ignorado por Git. Portas locais vinculadas a `127.0.0.1`; nenhum túnel público.
- [ ] Escrever primeiro este teste de fronteira; `api` sem identidade deve funcionar antes de existir o restante do produto:

```ts
import { expect, test } from 'vitest';
import { api } from '../apoio/cenario';
test('não fornece equipe sem sessão nem oferece cadastro público', async () => {
  expect((await api(null, '/api/equipe')).status).toBe(401);
  expect((await api(null, '/api/auth/sign-up/email', 'POST', {
    name: 'Pessoa de teste', email: 'pessoa@example.test', password: 'SenhaFicticia123!'
  })).status).toBe(404);
  expect((await api(null, '/api/auth/admin/create-user', 'POST', {})).status).toBe(404);
});
```

- [ ] Executar `npm run test:integracao -- acesso`. Esperado inicialmente: falha pela ausência das rotas/política, não por não conseguir iniciar PostgreSQL.
- [ ] Implementar ambiente validado, migração com bloqueio exclusivo e tabela de migrações. Configurar Better Auth com PostgreSQL, `disableSignUp: true`, `revokeSessionsOnPasswordReset: true`, cookie seguro em HTTPS, origens explícitas e cache de sessão desativado. Nunca atribuir o papel `admin` da biblioteca; Gestor pertence à tabela `membros`. Plugin admin somente para provisionamento interno. A API de criação direta e seus poderes estão descritos na [documentação oficial](https://better-auth.com/docs/plugins/admin).
- [ ] Implementar gateway com lista explícita de caminhos necessários: `sign-in/email`, `sign-out`, `get-session`, `request-password-reset`, `reset-password` e `change-password`. Rejeitar os demais com 404, incluindo todos os métodos em `/admin/*`, cadastro e exclusão de conta. Restringir método por endpoint e manter verificações de origem da biblioteca. Exemplo da borda própria:

```ts
const permitidos = new Set(['sign-in/email', 'sign-out', 'get-session',
  'request-password-reset', 'reset-password', 'change-password']);
export async function encaminhar(req: Request): Promise<Response> {
  const caminho = new URL(req.url).pathname.slice('/api/auth/'.length);
  if (!permitidos.has(caminho)) return new Response(null, { status: 404 });
  return auth.handler(req);
}
```

`auth` é exportado de `src/acesso/auth.ts`; `GET` e `POST` do route chamam `encaminhar`. Testar também grafias codificadas e barras extras: não normalizar um caminho bloqueado para permiti-lo. Ativar limitador persistido no banco para login/recuperação: 5 tentativas por minuto por chave de origem; limites adicionais por conta no serviço de recuperação, sem revelar existência.
- [ ] Implementar `exigirAtor`: obter sessão no servidor; consultar `membros` por ID; exigir `estado = ativo`; devolver apenas ID e perfil atual. `bloquearAtor` repete essa consulta com bloqueio dentro da transação. `executar` verifica Origin igual a `APP_ORIGIN` nas escritas e captura falhas conhecidas; nunca aceitar ator/perfil enviado no corpo.
- [ ] Criar o GET `/api/equipe` já nesta tarefa com a lista real de membros, acessível apenas a gestor ativo, para exercitar a fronteira. A tarefa 2 acrescenta criação e interface. O servidor de teste usa `next start` após build, espera a porta responder e encerra apenas o processo que iniciou, incluindo seus filhos; falhas de inicialização são reportadas como infraestrutura, não como teste vermelho de comportamento.
- [ ] Rodar `npm run test:integracao -- acesso`, `npm run typecheck` e `npm run build`; registrar saídas reais. Commit: `feat: preparar acesso protegido e ambiente do CRM Ideali`.

## Tarefa 2 — ingresso, recuperação de acesso e lista da equipe

**Arquivos:** criar `acesso/provisionar.ts`, `mensagens.ts`, `equipe/repositorio.ts`, `servidor/operacoes.ts`, páginas recuperar/definir senha, script primeiro gestor, API/lista de equipe; ampliar configuração auth e apoio de teste. Testar `testes/integracao/convites.test.ts` e `testes/telas/acesso.spec.ts`.

**Interfaces:** consome `exigirAtor`, `transacao` e `Membro` da tarefa 1; produz:

```ts
export type ConvidarMembro = { operacaoId: string; nome: string; email: string; perfil: Perfil };
export function convidarMembro(ator: Ator, dados: ConvidarMembro): Promise<Membro>;
export function listarEquipe(ator: Ator): Promise<Membro[]>;
export function enviarRecuperacao(email: string): Promise<void>;
export function enviarMensagem(destino: string, assunto: string, texto: string): Promise<void>;
export function executarUmaVez<T>(tx: Tx, atorId: string, operacaoId: string,
  tipo: string, alvo: string | null, corpo: unknown,
  gravar: () => Promise<{ resultadoId: string; versao: number; valor: T }>,
  reler: (resultadoId: string) => Promise<T>): Promise<T>;
```

Implementar `executarUmaVez` nesta tarefa: bloquear a chave ator/operação, comparar SHA-256 do corpo com chaves ordenadas e gravar identificador/versão do resultado junto com a transação de negócio. No reenvio, reler o resultado autorizado; corpo divergente retorna 409. A criação externa da identidade auth é reconciliada antes dessa transação, sob o bloqueio por e-mail descrito abaixo. Recibo não deve reter senha, token ou DTO privado.

- [ ] Escrever testes: corretor recebe 403 ao criar/listar equipe; gestor consegue criar o 12º integrante; convite repetido não duplica usuário; conta desconhecida/inativa recebe mesma resposta de recuperação sem mensagem; token vencido ou reutilizado não altera senha. Exemplo de contrato HTTP:

```ts
import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { api, criarCenario } from '../apoio/cenario';
test('só o gestor convida e repetição não duplica', async () => {
  const c = await criarCenario();
  try {
    const corpo = { operacaoId: randomUUID(), nome: 'Integrante de teste',
      email: 'integrante@example.test', perfil: 'corretor' };
    expect((await api(c.corretorA, '/api/equipe', 'POST', corpo)).status).toBe(403);
    const primeira = await api(c.gestor, '/api/equipe', 'POST', corpo);
    const repetida = await api(c.gestor, '/api/equipe', 'POST', corpo);
    expect(primeira.status).toBe(201);
    expect((await repetida.json()).id).toBe((await primeira.json()).id);
  } finally { await c.limpar(); }
});
```

- [ ] Rodar `npm run test:integracao -- convites` e constatar falha esperada.
- [ ] Criar usuário da biblioteca por chamada somente no servidor com senha aleatória não entregue ao gestor. Cadastrar membro como `convidado`; enviar link para definir senha. Após redefinição válida, atualizar somente `convidado → ativo`; nunca `inativo → ativo`. Manter recuperação com resposta genérica. Revalidar o estado no hook de criação de sessão e impedir login de membro inativo; sessão/rota privada exigem membro ativo. As opções de redefinição devem seguir a [referência de configuração](https://better-auth.com/docs/reference/options).

O callback `sendResetPassword` da própria configuração consulta o estado do membro antes de enviar; assim o acesso direto ao endpoint permitido não contorna a regra de `enviarRecuperacao`. O callback de redefinição só ativa convite ainda válido. Definir expiração de 1 hora; reenvio invalida convites anteriores. Conferir no teste real da versão instalada o uso único e essa invalidação, implementando o controle adicional de convite se a biblioteca permitir mais de um token simultâneo.

```ts
const credencial = await auth.api.createUser({ body: {
  email: dados.email.trim().toLowerCase(), name: dados.nome.trim(),
  password: randomBytes(48).toString('base64url'), role: 'user'
} });
// A identidade criada ainda não concede acesso ao CRM.
// Associar membros apenas após revalidar o gestor numa transação de negócio.
```

Importar `randomBytes` de `node:crypto`. Criação auth e associação de negócio usam transações diferentes: se falhar a associação, a identidade órfã não acessa o CRM. Repetir reconcilia pelo e-mail normalizado, sem apagar outra conta ou conceder perfil até revalidar o gestor. Serializar provisionamento por e-mail com advisory lock mantido em conexão dedicada; não usar a mesma conexão da transação interna do auth. Registrar convite somente após associação confirmada. Falha SMTP mantém convite pendente e permite reenviar; não anunciar entrega do e-mail como confirmada.
- [ ] Preparar primeiro gestor por script local, sem rota web de bootstrap. Recusar execução quando já existe qualquer gestor ativo ou convidado, usando `controle_equipe` para a verificação final. Entrada do e-mail/nome via prompt, não gravar senha ou token no terminal. Reenviar convite inicial é operação separada idempotente. Em desenvolvimento a mensagem chega apenas ao Mailpit.
- [ ] Implementar as telas com “Entrar”, “Esqueci minha senha”, “Definir senha” e “Convidar integrante”. Senha de 12 a 128 caracteres; permitir colar e usar gerenciador. Retorno de recuperação: “Se esse acesso estiver cadastrado, você receberá as instruções.” Aceitar retorno apenas a caminho relativo interno, nunca URL externa.
- [ ] Rodar os testes da tarefa e `npm run test:telas -- acesso`; confirmar redefinição revoga sessões anteriores e convite não permite escolher Gestor pelo navegador. Commit: `feat: permitir ingresso e recuperação de acesso da equipe`.

## Tarefa 3 — catálogo consultável com separação dos dados internos

**Arquivos:** criar migração 003, `imoveis/politica.ts`, `consulta.ts`, rotas GET de imóveis/ficha/histórico, contratos do histórico; ampliar apoio com imóveis fictícios. Testar `testes/integracao/permissoes-imoveis.test.ts`.

**Interfaces:** consome Ator, ImovelBase, ImovelDetalhe, FiltroImoveis e Tx; produz:

```ts
export function podeConsultar(ator: Ator, imovel: ImovelBase): boolean;
export function podeEditar(ator: Ator, imovel: ImovelBase): boolean;
export function listarImoveis(ator: Ator, filtro: FiltroImoveis): Promise<Pagina<ImovelBase>>;
export function obterImovel(ator: Ator, id: string): Promise<ImovelDetalhe>;
export function listarHistorico(ator: Ator, id: string): Promise<Historico[]>;
// Acrescentar ao apoio de teste: insere somente no banco de teste.
export function semearImovel(responsavelId: string,
  situacao: Situacao, internos?: Partial<DadosInternos>): Promise<{ id: string; versao: number }>;
```

- [ ] Testar as cinco situações com gestor/dono/outro corretor/sem sessão. Exemplo que deve falhar antes das projeções:

```ts
import { expect, test } from 'vitest';
import { api, criarCenario, semearImovel } from '../apoio/cenario';
test('catálogo compartilhado não revela proprietário nem rascunho de outro', async () => {
  const c = await criarCenario();
  try {
    const disponivel = await semearImovel(c.corretorA.id, 'disponivel',
      { proprietarioNome: 'PROPRIETARIO_EXCLUSIVO_TESTE' });
    const rascunho = await semearImovel(c.corretorA.id, 'rascunho');
    const ficha = await api(c.corretorB, `/api/imoveis/${disponivel.id}`);
    expect(ficha.status).toBe(200);
    expect(await ficha.text()).not.toContain('PROPRIETARIO_EXCLUSIVO_TESTE');
    expect((await api(c.corretorB, `/api/imoveis/${rascunho.id}`)).status).toBe(404);
    const busca = await api(c.corretorB, '/api/imoveis?busca=PROPRIETARIO_EXCLUSIVO_TESTE');
    expect((await busca.json()).total).toBe(0);
  } finally { await c.limpar(); }
});
```

- [ ] Rodar `npm run test:integracao -- permissoes-imoveis`; verificar falha por acesso/projeção ainda não implementados.
- [ ] Implementar política idêntica na consulta SQL e na verificação de objeto. Regra central:

```ts
export function podeEditar(ator: Ator, imovel: ImovelBase): boolean {
  return ator.perfil === 'gestor' || imovel.responsavelId === ator.id;
}
export function podeConsultar(ator: Ator, imovel: ImovelBase): boolean {
  return podeEditar(ator, imovel) || ['disponivel', 'reservado'].includes(imovel.situacao);
}
```

Selecionar explicitamente as colunas permitidas; nunca `SELECT *` de uma junção com internos. `internos = null` e `documentos = []` para outro corretor. Histórico nesta parte é restrito a gestor/dono: evita vazamento dos detalhes de operações internas. Não buscar campos privados para depois apenas esconder no React. Lista, busca e contagem usam o mesmo predicado de acesso.

Até a tarefa 5, a consulta retorna `fotos = []`, `documentos = []` e `capaId = null`; não consultar a tabela de arquivos antes de sua migração. A tarefa 5 substitui esses resultados vazios pelas consultas autorizadas, sem alterar o contrato.
- [ ] Validar filtros e limitar paginação; responder 404 tanto para registro inexistente quanto invisível. Respostas privadas `Cache-Control: private, no-store`; páginas privadas dinâmicas, sem cache compartilhado entre usuários. Registros vazios devem produzir lista vazia verdadeira.
- [ ] Rodar os testes desta tarefa; conferir resposta HTTP inteira, não apenas campos da tela. Commit: `feat: separar catálogo compartilhado e informações internas`.

## Tarefa 4 — rascunho, edição e situação com controle de versão

**Arquivos:** criar `imoveis/gravacao.ts`, `validacao.ts`, rotas de gravação, páginas novo/editor e componentes de campo/aviso; consumir `servidor/operacoes.ts` da tarefa 2. Testar `testes/integracao/gravacao-imoveis.test.ts`, `testes/unidade/valores.test.ts`.

**Interfaces:** consome política, transação e contratos comuns; produz:

```ts
export function criarImovel(ator: Ator, dados: CriarImovel): Promise<ImovelDetalhe>;
export function salvarImovel(ator: Ator, id: string, dados: SalvarImovel): Promise<ImovelDetalhe>;
export function trocarSituacao(ator: Ator, id: string, dados: TrocarSituacao): Promise<ImovelDetalhe>;
export function moedaParaCentavos(texto: string): number | null;
```

`executarUmaVez` bloqueia por chave, compara hash canônico de corpo, grava recibo na mesma transação e, no reenvio, relê pela autorização atual. Nunca reaplica a alteração. Hash com SHA-256 e serialização de chaves ordenadas. Sem expiração automática dos recibos nesta parte; planejar retenção após medir volume.

- [ ] Testar rascunho mínimo, autorização, repetição e conflito. Exemplo:

```ts
import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { api, criarCenario } from '../apoio/cenario';
test('rascunho mínimo é idempotente e situação usa a versão', async () => {
  const c = await criarCenario();
  try {
    const entrada = { operacaoId: randomUUID(), tipo: 'casa', cidade: 'Cidade de Teste' };
    const r = await api(c.corretorA, '/api/imoveis', 'POST', entrada);
    expect(r.status).toBe(201);
    const imovel = await r.json();
    const repetida = await api(c.corretorA, '/api/imoveis', 'POST', entrada);
    expect((await repetida.json()).id).toBe(imovel.id);
    const url = `/api/imoveis/${imovel.id}/situacao`;
    const mudar = (situacao: string) => api(c.corretorA, url, 'POST', {
      operacaoId: randomUUID(), versao: imovel.versao, situacao
    });
    const respostas = await Promise.all([mudar('disponivel'), mudar('arquivado')]);
    expect(respostas.map(x => x.status).sort()).toEqual([200, 409]);
  } finally { await c.limpar(); }
});
```

- [ ] Rodar `npm run test:integracao -- gravacao-imoveis` e `npm run test:unidade -- valores`; confirmar falhas esperadas.
- [ ] Implementar mínimos e limites: cidade 2–120, bairro até 120, título até 160, descrição até 10.000 caracteres; responsável ativo; tipo enumerado; contagens inteiras 0–999 ou null; áreas positivas até 1 bilhão m² com duas casas ou null; dinheiro inteiro seguro até 100 bilhões de centavos. Descrição como texto, sem HTML executável. Condomínio/IPTU podem ser zero informado, mas vazio é null. Preço da oferta deve ser positivo quando informado.
- [ ] `sobConsulta` pode coexistir com preço interno; em futura publicação, o preço numérico só será público quando `sobConsulta = false`. Nesta parte, essa distinção aparece claramente no formulário. Terreno/rural não exigem quartos, banheiros ou vagas; demais tipos podem mostrar recomendações sem impedir rascunho. Situação disponível exige tipo/cidade, não requisitos de publicação. Não tratar a conclusão da ficha como publicação.
- [ ] Atualizar apenas após permissão e versão válidas. Padrão SQL dentro da transação:

```sql
UPDATE imoveis
SET situacao = $1, versao = versao + 1, atualizado_em = now()
WHERE id = $2 AND versao = $3
RETURNING id, versao;
```

Se não retornar linha, responder conflito sem alterar histórico/recibo. A versão cobre dados, situação, responsável, fotos e documentos. Alteração de campos e internos ocorre na mesma transação. Não permitir trocar responsável pela rota de edição genérica.
- [ ] Implementar as três partes do formulário: O imóvel; Fotos e anúncio; Detalhes. Primeiro salvamento gera o código e mantém a pessoa na ficha. Botão “Salvar alterações” tem estado de envio e retorna “Alterações salvas” só após confirmação. Em 409 mostrar “Este imóvel foi alterado por outra pessoa. Revise a versão mais recente antes de salvar.” Preservar campos locais e oferecer ver valores atuais sem sobrescrever automaticamente.
- [ ] Rodar os testes da tarefa e `npm run typecheck`. Commit: `feat: cadastrar imóveis com rascunho e proteção contra sobrescrita`.

## Tarefa 5 — fotos e documentos com acesso controlado

**Arquivos:** criar migração 004, arquivos armazenamento/s3/serviço/validação, rotas de arquivos/fotos e componentes de fotos/documentos. Testar `testes/integracao/arquivos.test.ts`, `testes/unidade/arquivos.test.ts`.

**Interfaces:** consome política e transações; produz:

```ts
export interface Armazenamento {
  colocar(chave: string, bytes: Uint8Array, mime: string): Promise<void>;
  obter(chave: string): Promise<{ bytes: Uint8Array; mime: string }>;
  remover(chave: string): Promise<void>;
}
export function adicionarArquivo(ator: Ator, imovelId: string,
  dados: AdicionarArquivo): Promise<ImovelDetalhe>;
export function organizarFotos(ator: Ator, imovelId: string,
  dados: OrganizarFotos): Promise<ImovelDetalhe>;
export function removerArquivo(ator: Ator, id: string,
  dados: { operacaoId: string; versao: number }): Promise<ImovelDetalhe>;
export function lerArquivo(ator: Ator, id: string): Promise<{
  bytes: Uint8Array; mime: string; nome: string; categoria: 'foto' | 'documento' }>;
```

- [ ] Escrever casos para foto compartilhada, documento privativo, arquivo de rascunho alheio, upload por outro corretor, extensão falsa, excesso de tamanho, reenvio, remoção da capa e IDs de ordenação de outro imóvel. Teste central com dois documentos em imóveis distintos deve manipular o ID no GET e confirmar 404; nunca bastará testar botão invisível.

```ts
import { expect, test } from 'vitest';
import { validarArquivo } from '../../src/arquivos/validacao';
test('extensão e MIME declarados não tornam HTML uma imagem', async () => {
  await expect(validarArquivo({ categoria: 'foto', nome: 'foto.jpg',
    mimeInformado: 'image/jpeg', bytes: new TextEncoder().encode('<script>alert(1)</script>')
  })).rejects.toMatchObject({ codigo: 'INVALIDO' });
});
```

`validarArquivo` recebe `Pick<AdicionarArquivo, 'categoria' | 'nome' | 'mimeInformado' | 'bytes'>` e retorna `Promise<{ bytes: Uint8Array; mime: string; nome: string }>` após validação/processamento. Criar fixtures binárias sintéticas válidas de JPEG/PNG/PDF, sem dados reais.
- [ ] Rodar `npm run test:unidade -- arquivos` e `npm run test:integracao -- arquivos`; confirmar falhas esperadas.
- [ ] Limites iniciais propostos: 40 fotos por imóvel, JPEG/PNG/WebP até 15 MB cada, 50 megapixels; 20 documentos PDF/JPEG/PNG até 20 MB cada. Fazer upload sequencial com progresso por arquivo. Rejeitar SVG, HTML, executáveis e arquivos vazios. Verificar assinatura e decodificação real das fotos; Sharp remove metadados e reencoda com lado máximo 2.560 px. Não confiar em nome, extensão ou MIME do cliente. PDF é apenas download, sem execução/preview HTML.
- [ ] Bucket totalmente privado. Toda leitura passa por `/api/arquivos/[id]`, autorizada a cada pedido; não emitir URL pública permanente nem devolver chave de armazenamento. Fotos usam política do catálogo; documentos exigem gestor/dono. Cabeçalhos `nosniff`, `private, no-store`; documentos como attachment com nome saneado.
- [ ] Upload valida limite ao receber o fluxo, antes de acumular conteúdo além do teto. Depois de processar os bytes, revalidar autorização/versão sob bloqueios, gravar objeto com chave única, inserir metadados/histórico/recibo e confirmar. Falha após upload exige tentativa de remoção do objeto órfão e registro técnico sem dado pessoal. Rotina de manutenção remove apenas objetos sem referência com mais de 24 horas. Não apagar o objeto antigo antes de confirmar a substituição.
- [ ] Capa pertence ao próprio imóvel e à categoria foto. Ordenação exige exatamente os IDs ativos daquele imóvel, sem repetição. Botões “Mover para a esquerda/direita” ou “Subir/descer” disponíveis sem arrastar. Remoção lógica esconde imediatamente, atualiza versão e escolhe a primeira foto restante como capa; sem fotos, capa null. Remoção física de objetos sem referência somente pela rotina de manutenção.

```ts
const ids = new Set(dados.idsOrdenados);
if (ids.size !== dados.idsOrdenados.length || ids.size !== fotosAtuais.length ||
    fotosAtuais.some(f => !ids.has(f.id)) ||
    (dados.capaId !== null && !ids.has(dados.capaId))) {
  throw new ErroDominio('INVALIDO', 'Confira a ordem e a capa das fotos.');
}
```

`ErroDominio` é a classe de `compartilhado/erros.ts`, com código de Falha e mensagem; `fotosAtuais` é a consulta das fotos ativas do imóvel já bloqueado. Repetir upload com a mesma chave não cria segunda foto.
- [ ] Rodar testes de arquivos contra MinIO privado real e verificar diretamente que GET anônimo no bucket nega acesso. Commit: `feat: proteger fotos e documentos dos imóveis`.

## Tarefa 6 — transferências e desligamento sem perder vínculos

**Arquivos:** criar `equipe/servico.ts`, ampliar repositório, APIs perfil/desativar/responsável, UI ações de equipe, testes `testes/integracao/equipe-concorrencia.test.ts`.

**Interfaces:** consome Ator, Tx, idempotência e contratos de equipe; produz:

```ts
export function transferirImovel(ator: Ator, id: string,
  dados: TransferirImovel): Promise<ImovelDetalhe>;
export function alterarPerfil(ator: Ator, id: string, dados: AlterarPerfil): Promise<Membro>;
export function desativarMembro(ator: Ator, id: string,
  dados: DesativarMembro): Promise<{ membro: Membro; imoveisTransferidos: number }>;
```

- [ ] Escrever corrida de duas operações com conexões independentes, não mocks, e teste de rollback ao provocar falha entre transferência e desativação. Testar ainda edição/atribuição concorrente ao desligamento e sessão antiga. Apoio `semearGestor(): Promise<SessaoTeste>` cria outro gestor com login real.

```ts
import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { api, criarCenario, semearGestor } from '../apoio/cenario';
test('duas mudanças simultâneas não removem o último gestor', async () => {
  const c = await criarCenario();
  try {
    const segundo = await semearGestor();
    const mudar = (ator: typeof segundo) => api(ator,
      `/api/equipe/${ator.id}/perfil`, 'POST', {
        operacaoId: randomUUID(), versao: 1, perfil: 'corretor'
      });
    const resultados = await Promise.all([mudar(c.gestor), mudar(segundo)]);
    expect(resultados.map(r => r.status).sort()).toEqual([200, 409]);
  } finally { await c.limpar(); }
});
```

- [ ] Rodar `npm run test:integracao -- equipe-concorrencia`; constatar falhas antes da implementação.
- [ ] Implementar ordem de bloqueio descrita em Persistência. Sob bloqueio da sentinela, consultar gestores ativos; impedir desativação ou rebaixamento do último. Convidado não conta como gestor ativo. Proibir alteração de perfil próprio por corretor, mesmo com corpo adulterado. Retornar conflito para versão antiga.

```sql
SELECT id FROM controle_equipe WHERE id = 1 FOR UPDATE;
SELECT id, perfil, estado, versao FROM membros
WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE;
SELECT count(*) FROM membros WHERE perfil = 'gestor' AND estado = 'ativo';
```

- [ ] Desativação: se possui imóveis, exigir destino diferente e ativo; bloquear destino e imóveis; transferir todos; incrementar versões; registrar responsáveis anteriores/novos; marcar membro inativo e incrementar versão; remover sessões auth desse usuário na mesma transação do banco. Adaptar nome de tabela/coluna ao esquema gerado, não presumir que a biblioteca use snake_case. Manter cadastro e autoria histórica. Não usar API externa de banimento como substituto da transação.
- [ ] Hook de criação de sessão e `exigirAtor` mantêm usuário inativo sem acesso mesmo diante de token antigo de recuperação ou corrida de login. Após transferência isolada, antigo corretor perde dados internos no pedido seguinte, mas conserva acesso ao catálogo compartilhado se o imóvel continuar disponível/reservado. Histórico do imóvel só aparece a gestor/dono atual; não transferir autoria.
- [ ] UI mostra quantidade de imóveis e destinatário antes de confirmar. Autodesativação de gestor só é permitida se outro gestor ativo permanecer; ao concluir, direcionar para entrada com mensagem adequada. Não adicionar botão de excluir pessoas.
- [ ] Rodar testes concorrentes/rollback e testes de acesso anteriores uma vez após a mudança. Commit: `feat: transferir imóveis e desativar acessos com consistência`.

## Tarefa 7 — experiência completa em celular e computador

**Arquivos:** completar catálogo, editor, equipe, navegação, estilos e componentes. Criar `testes/telas/catalogo.spec.ts`, `cadastro.spec.ts`, `equipe.spec.ts`; configuração Playwright para 320×740, 390×844 e 1440×900.

**Interfaces:** consome APIs anteriores; nenhum DTO privado pode ser duplicado em armazenamento do navegador. Formulários mantêm estado React na tela; upload preserva os arquivos ainda selecionados enquanto a página ficar aberta. Não prometer retomada após recarregar ou fechar.

- [ ] Escrever jornadas no navegador: entrar, localizar, criar rascunho, completar, anexar, ordenar, trocar situação, transferir e sair. Testar busca vazia, carregamento, erro de rede e erro 409; testar teclado e leitor de rótulos. Exemplo de formulário mínimo:

```ts
import { test, expect } from '@playwright/test';
test('cria rascunho no celular sem exigir dados opcionais', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/imoveis/novo');
  await page.getByLabel('Tipo do imóvel').selectOption('casa');
  await page.getByLabel('Cidade').fill('Cidade de Teste');
  await page.getByRole('button', { name: 'Salvar rascunho' }).click();
  await expect(page.getByText('Rascunho salvo')).toBeVisible();
  const temRolagem = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(temRolagem).toBe(false);
});
```

A configuração do teste cria sessão fictícia autenticada em `storageState` temporário ignorado por Git; não salvar credenciais reais. Cada projeto usa seus próprios dados para evitar interferência.
- [ ] Rodar `npm run test:telas`; observar falhas antes dos ajustes finais de interface.
- [ ] Implementar estilo Ideali: marca em preto/dourado nos pontos de identidade, superfícies claras para leitura, contraste legível, foco visível. Menu lateral no computador e navegação curta no celular. Ações principais com texto; ícones complementares. Aplicar rótulos persistentes, resumo de erros com foco e mensagem junto do campo; feedback `aria-live`.
- [ ] Catálogo mostra foto ou estado “Sem foto”, código, cidade/bairro, preço ou “Sob consulta”/“Preço não informado”, situação e responsável. Não exibir “Publicado” nesta parte. Ficha própria oferece editar; imóvel compartilhado somente consulta. Filtros ficam na URL sem nomes de proprietários; botão “Limpar filtros”.
- [ ] Preservar edição em falha e conflito. Nunca limpar formulário no bloco `finally`. Núcleo esperado:

```ts
setSalvando(true);
try {
  const resposta = await fetch(`/api/imoveis/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operacaoId, versao, campos, internos })
  });
  const retorno = await resposta.json();
  if (!resposta.ok) { setErro(retorno.erro.mensagem); return; }
  setVersao(retorno.versao);
  setOperacaoId(crypto.randomUUID());
  setAviso('Alterações salvas');
} catch {
  setErro('Não foi possível confirmar o salvamento. Seus dados continuam nesta tela.');
} finally { setSalvando(false); }
```

Os setters pertencem ao estado de `editor.tsx`; `operacaoId` é reutilizado apenas enquanto o corpo enviado não muda. Em resposta sem JSON válido, a mesma mensagem de falha se aplica. Diálogo de conflito mostra dados atuais separadamente; botão de substituir exige revisão explícita e usa a versão mais recente.
- [ ] Conferir visualmente as três larguras e navegação por teclado. Rodar testes de telas, typecheck, lint e build. Registrar limitações encontradas; não chamar teste automatizado de avaliação humana. Commit: `feat: concluir experiência responsiva de equipe e catálogo`.

## Tarefa 8 — restauração e entrega verificável

**Arquivos:** criar `scripts/backup.ts`, `scripts/restaurar.ts`, `docs/avaliacao-parte-1.md`; completar README, Dockerfile e relatório de testes. Testar `testes/integracao/restauracao.test.ts`.

**Interfaces:** comandos `npm run backup -- --destino <pasta>` e `npm run restaurar -- --origem <pasta> --bucket-destino <nome>`. Banco de destino vem de `RESTORE_DATABASE_URL`, sem credenciais nos argumentos do terminal. Recusar banco/bucket iguais à origem e qualquer alvo que não esteja explicitamente marcado como ambiente de restauração. Credenciais só por ambiente, nunca no relatório.

- [ ] Definir teste de restauração com fixture sintética: 3 integrantes, 3 imóveis, 2 fotos, 1 documento, transferências no histórico. Alterar a cópia do ambiente de teste, restaurar em uma segunda base vazia e comparar contagens, vínculos, hashes e permissões. Escrever `testes/integracao/restauracao.test.ts` com este núcleo:

```ts
expect(restaurado.imoveis).toBe(original.imoveis);
expect(restaurado.arquivos).toBe(original.arquivos);
expect(restaurado.hashes).toEqual(original.hashes);
expect(restaurado.vinculosValidos).toBe(true);
expect(restaurado.sessoesAtivas).toBe(0);
```

`original` e `restaurado` são objetos `{ imoveis: number; arquivos: number; hashes: string[]; vinculosValidos: boolean; sessoesAtivas: number }`, obtidos no teste por contagens SQL, verificação de FKs e SHA-256 ordenado dos bytes. Executar os scripts reais por subprocesso; não substituir backup por mock.
- [ ] Rodar o teste e constatar falha enquanto scripts não existem. Implementar backup com `pg_dump --format=custom` e cópia dos objetos referenciados, manifesto de hashes e versão das migrações. Usar janela de manutenção sem gravações para obter consistência entre banco e arquivos; sem tráfego público durante o ensaio. Restaurar com `pg_restore` em base vazia, validar manifesto e revogar todas as sessões restauradas. Artefatos de backup ficam ignorados por Git e sem dados reais neste ensaio.
- [ ] Executar a suíte final uma vez: `npm run test:unidade`, `npm run test:integracao`, `npm run test:telas`, `npm run typecheck`, `npm run lint`, `npm run build`. Repetir apenas o que falhar ou for afetado por uma correção. Se ambiente impedir um teste, registrar “não executado” e o motivo; não marcar a entrega pronta para dados reais.
- [ ] Registrar roteiro de avaliação para Eder e dois corretores: criar imóvel só com tipo/cidade; encontrar imóvel; completar fotos; confirmar o que outro corretor enxerga; adicionar integrante; transferir imóvel. Preparar dados fictícios identificados e espaço para anotar dúvidas. A avaliação humana será feita com a equipe; o agente não pode afirmar que ela ocorreu sozinho.
- [ ] Preparar guia de abrir/fechar a versão local, recuperação, persistência, backup e limites. Entregar URL local somente se servidor tiver sido iniciado e verificado; se não, entregar o projeto e o impedimento exato. Nenhum link público ou domínio de produção é criado por esta tarefa. Commit: `docs: registrar verificação e avaliação da primeira entrega`.
- [ ] Empacotar os fontes revisados em `C:\Users\Ideali Imoveis\Documents\Codex\2026-09-23\q\outputs\CRM Ideali — Parte 1.zip`, incluindo README e lockfile. Excluir `.env*` reais, credenciais, bancos, backups, tokens de teste, `node_modules` e arquivos temporários; incluir somente `.env.example` sem valores secretos. O pacote é a entrega do código; a pasta `work` permanece o ambiente de construção.

## Dependências e ordem

Executar 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Revisões podem ocorrer por tarefa. A UI pode ser refinada enquanto testes de outra área são analisados, mas somente um responsável altera um arquivo por vez. Auth, membros, permissões e arquivos merecem revisão independente antes de serem considerados estáveis.

## Conferência de cobertura da proposta

| Seção da proposta | Tratamento |
|---|---|
| 1–2, objetivo e caminho | Esta entrega prepara CRM próprio por etapas; não substitui operação atual |
| 3, navegação | Imóveis/Equipe funcionais nesta parte; Hoje/Clientes/Agenda na Parte 3 |
| 4, acessos | Tarefas 1–3, 5 e 6; clientes/tarefas só passam a compor transferência quando existirem na Parte 3 |
| 5, imóvel/publicação | Cadastro/fotos/documentos/situação nas tarefas 3–5; snapshots, prévia e oferta pública na Parte 2 |
| 6–7, interessados e site | Parte 2 recebe solicitações; Parte 3 atribui e acompanha; sem atalhos falsos nesta entrega |
| 8, dados/proteção | Tarefas 1, 3–6 e 8; banco central, autorização, versão e restauração |
| 9, entregas/limites | Equipe e catálogo completos conforme este plano; demais módulos preservados no escopo seguinte |
| 10, migração/custo | Não importar sem amostra; não cancelar contrato; cotar infraestrutura antes do piloto hospedado |
| 11, aceitação | Rascunho, acesso interno, conflito, desativação e 12º usuário verificáveis aqui; jornada completa será validada após Partes 2–4 |

Autorrevisão do plano: dependências e nomes de contratos conferidos; cinco riscos de revisão alocados; requisitos de publicação e atendimento identificados como fases seguintes, não declarados implementados. Este documento contém passos e testes a executar, não evidência de que a aplicação já passou neles.

## Decisão de execução

Recomendação: **construção com revisão independente por etapa**, porque permissões, arquivos e desativação compartilham regras cujo erro pode expor dados ou tirar acesso da equipe. Alternativa: implementação concentrada pelo agente principal com revisão independente ao final, usando menos contextos de trabalho.

Após a revisão deste plano e escolha do método, iniciar a tarefa 1. Não é necessário reabrir a aprovação da proposta de produto já recebida.
