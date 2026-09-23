# CRM Ideali — proposta da primeira versão

**Data:** 23/09/2026  
**Situação:** proposta aprovada por Eder em 23/09/2026, após a apresentação deste documento, com a resposta “sim”. O sistema ainda não foi construído.  
**Base:** conversa com Eder, inspeção da conta da Ideali no Praedium e do site [imoveisideali.com.br](https://imoveisideali.com.br/).

## 1. O resultado que queremos

Um CRM próprio da Ideali, integrado ao site, no qual a equipe encontre rapidamente o cliente, o imóvel e a próxima ação. Deve funcionar no celular e no computador e permitir que a equipe cresça a partir das 11 pessoas atuais.

Eder confirmou três objetivos: reduzir custo, simplificar a rotina e acrescentar funções úteis. Considera o Praedium complexo de usar. Economia será avaliada pelo custo total de implantação e operação; ainda não há orçamento, valores de hospedagem ou comparação com a mensalidade atual.

O critério central de utilidade será completar este percurso: **cadastrar imóvel → publicar anúncio → receber interessado → atribuir responsável → acompanhar atendimento e próximo retorno**.

### Histórico da definição e aprovação

A tabela registra como as definições surgiram. A aprovação posterior deste documento inclui suas regras e limites para a primeira versão. O plano de implementação será revisado separadamente antes da construção.

| Situação | Definição |
|---|---|
| Confirmado por Eder | CRM próprio integrado ao site; Praedium como referência; simplicidade, custo e novas funções; celular e computador; 11 pessoas inicialmente e possibilidade de crescimento. |
| Premissa adotada ao receber “prossiga” | Gestor acompanha toda a operação; corretor acompanha sua carteira; catálogo de imóveis compartilhado. Eder pediu para avançar após essa sugestão, sem escolher explicitamente entre as opções de visibilidade. |
| Proposta deste documento | Organização das telas, regras detalhadas de acesso e publicação, entrada de contatos pelo site, divisão das entregas e limites abaixo. |

## 2. Caminho recomendado

| Caminho | Vantagem | Compromisso |
|---|---|---|
| **CRM e site próprios, entregues em etapas — recomendado** | Permite desenhar a rotina da Ideali e manter uma única fonte para os anúncios. | Exige construção, operação e migração planejada. |
| Site próprio ligado ao Praedium | Pode antecipar mudanças no site. | Mantém dependência do CRM atual e exige verificar os meios de integração disponíveis na conta. |
| Adaptar outro sistema pronto | Aproveita funções já existentes. | Pode repetir a complexidade atual; depende de avaliar produto, permissões e custos. |

A proposta segue o primeiro caminho. A operação atual continua durante a construção. A troca do domínio e o encerramento do serviço atual pertencem à etapa de transição, depois da conferência dos dados e do funcionamento.

## 3. Como a equipe vai navegar

Quatro áreas principais para o corretor: **Hoje, Clientes, Imóveis e Agenda**. O gestor também terá **Gestão**, com equipe, entradas do site, resultados e configurações. “Clientes” inclui interessados ainda em atendimento; não significa apenas quem já comprou.

| Área | Primeira coisa que aparece | Ações principais |
|---|---|---|
| Hoje | Retornos atrasados, retornos do dia e visitas, em grupos separados. Aviso de atendimentos sem próxima ação. | Abrir atendimento, registrar resultado, concluir ou reagendar tarefa. |
| Clientes | Pessoas da carteira e seus atendimentos. Alternância entre lista e funil. | Cadastrar interessado, consultar histórico, selecionar imóveis, mudar etapa e agendar retorno. |
| Imóveis | Foto, código, bairro/cidade, preço e situação. Publicação identificada separadamente. | Buscar, cadastrar, completar dados, conferir anúncio e acompanhar disponibilidade. |
| Agenda | Tarefas e visitas por data, com atrasados sempre acessíveis. | Agendar, reagendar, concluir e cancelar com registro no histórico. |
| Gestão | Solicitações do site sem responsável, visão da equipe e indicadores básicos. | Distribuir contatos, transferir carteira, gerenciar acessos e publicar anúncios. |

No computador, menu lateral e espaço para listas e funil. No celular, navegação curta e cartões com ações de toque; a mudança de etapa terá um botão, sem depender de arrastar cartões. As tarefas essenciais estarão disponíveis nos dois formatos.

Campos terão rótulos visíveis, obrigatoriedade identificada e erros próximos ao campo. As telas principais devem funcionar em uma coluna sem rolagem horizontal a partir de 320 pixels CSS. São critérios de projeto apoiados nas orientações do W3C sobre [rótulos de formulários](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) e [adaptação do conteúdo à largura disponível](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html); a conformidade da aplicação dependerá de testes quando ela existir.

## 4. Quem pode acessar cada informação

Dois perfis iniciais: **Gestor** e **Corretor**. Cada integrante tem uma conta própria. A quantidade inicial de 11 pessoas não será um limite fixo no cadastro de usuários.

| Informação ou ação | Gestor | Corretor |
|---|---|---|
| Catálogo operacional de imóveis | Todos os imóveis. | Imóveis disponíveis e reservados da equipe; também seus próprios rascunhos e imóveis encerrados. |
| Dados de anúncio | Consulta e edição geral. | Consulta do catálogo e edição dos imóveis pelos quais é responsável. |
| Proprietário, documentos e observações internas do imóvel | Todos. | Somente dos imóveis pelos quais é responsável. |
| Clientes, atendimentos e tarefas | Toda a equipe. | Somente sua carteira. |
| Cadastro de cliente | Pode definir o responsável. | O cadastro nasce em sua própria carteira. |
| Publicar, atualizar ou retirar anúncio manualmente | Permitido. | Solicita publicação/atualização ao gestor. |
| Criar e desativar usuários; mudar perfis; transferir carteira | Permitido. | Não permitido. |
| Resultados comerciais | Equipe e filtros por corretor. | Indicadores apenas de sua carteira. |

Na primeira versão proposta, cada cliente tem um único corretor responsável; seus atendimentos herdam esse responsável. Uma pessoa pode ter vários atendimentos, mas o compartilhamento da mesma pessoa entre corretores será uma evolução separada. Isso evita misturar histórias e acessos na ficha.

A transferência de cliente é feita pelo gestor e leva seus atendimentos, históricos e tarefas vinculadas ao novo responsável, registrando autor, data e responsáveis anterior e novo. O corretor anterior perde o acesso àquela carteira. A transferência de responsabilidade por um imóvel é independente.

Ao desativar um integrante, o acesso é encerrado e o histórico permanece. A desativação exige transferir clientes, tarefas e imóveis sob sua responsabilidade para outro integrante ativo na mesma operação. O sistema impede desativar o último gestor ativo ou mudar seu perfil para corretor enquanto não houver outro gestor ativo.

As restrições valem também nas consultas e gravações do servidor, nos resultados de busca e nos anexos; esconder botões não é suficiente.

## 5. Cadastrar e publicar um imóvel

O formulário será organizado em três partes, com salvamento de rascunho:

1. **O imóvel:** tipo, cidade, bairro, preço, quartos, banheiros, vagas e áreas. Endereço completo e proprietário ficam na parte interna. O criador é o responsável inicial, salvo escolha do gestor.
2. **Fotos e anúncio:** adicionar e ordenar fotos, escolher capa, título e descrição; conferir prévia para celular e computador.
3. **Detalhes:** características, condomínio, IPTU, estágio da obra, entrega, condições comerciais e documentos internos, abertos quando necessários.

Para salvar um rascunho bastam tipo e cidade. Para publicar, serão exigidos: situação disponível, tipo, cidade, bairro, título, descrição, foto de capa e preço válido ou escolha explícita de “sob consulta”. Quartos, banheiros, vagas e áreas aparecem como pendências quando aplicáveis; valor desconhecido não será transformado em zero.

**Situação comercial:** rascunho, disponível, reservado, vendido ou arquivado. **Publicação:** não publicado, publicado ou alterações pendentes. São controles diferentes.

Salvar o cadastro mantém as alterações internas. Para colocar conteúdo novo no ar, o gestor usa **Publicar anúncio** ou **Publicar alterações** após ver a prévia. O site mantém a última versão publicada até essa ação. A ficha mostra claramente quando existem alterações ainda não publicadas.

Somente imóveis disponíveis podem ter oferta pública. Marcar um imóvel como reservado, vendido, arquivado ou rascunho retira sua oferta pública; esse efeito será informado junto à ação. Retorná-lo a disponível não republica automaticamente. O corretor responsável pode atualizar essa situação, e a ação fica no histórico.

O anúncio público usa uma seleção explícita de campos. Proprietário, documentos, informações de chaves e observações internas ficam fora dela. A localização pública inicial será bairro e cidade; a divulgação do endereço exato exige uma escolha própria do gestor.

Para a primeira versão, cada unidade comercializável terá um cadastro. Agrupamento de empreendimentos e tabelas de unidades ficam para um módulo posterior; não se misturam área de uma unidade e preço de outra no anúncio.

## 6. Receber e acompanhar um interessado

### Entrada pelo site

O formulário pede nome e telefone, com e-mail e mensagem opcionais. O imóvel consultado, a origem e a data acompanham o envio. Na confirmação, a pessoa recebe apenas a indicação de que o pedido foi recebido, sem informações da carteira interna.

O envio cria uma solicitação na fila do gestor. Nada fica sem destino: enquanto não houver corretor, aparece como **Aguardando responsável**. Ao criar um cliente novo, o gestor escolhe seu responsável e o atendimento o herda. Ao vincular a solicitação a um cliente existente, o atendimento mantém o responsável daquele cliente; escolher outro exige a transferência explícita da carteira inteira desse cliente, conforme a seção 4. A distribuição automática por rodízio fica para uma etapa posterior, após definição das regras da equipe.

Repetir a mesma tentativa de envio não cria várias solicitações. Outro envio da mesma pessoa em outro momento pode ser legítimo: será sinalizado para revisão, sem juntar registros silenciosamente. Os formulários terão validação e proteção contra envios abusivos.

### Ficha do cliente

A ficha reúne dados básicos e cartões dos atendimentos daquela pessoa. Cada atendimento tem nome do interesse, imóveis relacionados, etapa, origem, próxima ação e histórico próprio. Encerrar um atendimento não encerra os demais.

O fluxo inicial preserva as etapas já observadas na operação: **Novo interessado → Atendimento → Visita agendada → Visita realizada → Proposta → Fechamento de contrato**. Ganho e perdido são resultados de encerramento, separados da etapa. Chegar a “Fechamento de contrato” não registra venda automaticamente.

Uma mudança de etapa registra autor e horário e oferece a próxima ação. É possível salvar sem agendar retorno, mas o atendimento aparece em “Sem próxima ação”. Registrar ganho exige data e valor fechado; perdido exige motivo. Reabrir um atendimento preserva o encerramento anterior no histórico.

O botão de WhatsApp abre a conversa com texto preparado para a pessoa revisar e enviar. Abrir esse botão não será registrado como mensagem enviada nem conversa respondida. Conversas automáticas e sincronização de histórico do WhatsApp não fazem parte desta primeira versão.

### Agenda e visitas

Tarefas e visitas pertencem a um responsável e podem se vincular a um atendimento e a um imóvel. Uma visita tem data, horário e imóvel. Marcar uma tarefa como concluída ou registrar resultado da visita alimenta o histórico; nenhuma dessas ações marca uma venda automaticamente.

Datas e horários são apresentados no fuso de São Paulo. Reagendamento mantém o registro da data anterior. Cancelamento de visita não apaga o evento.

## 7. O site da Ideali

A primeira versão terá página inicial, busca, lista de imóveis, página individual, apresentação da imobiliária e contato. A busca oferecerá cidade/bairro, tipo, faixa de preço, quartos e vagas. A página do imóvel mostrará fotos, dados do anúncio, formulário de interesse e botão de WhatsApp.

O gestor poderá escolher destaques e alterar textos institucionais, informações de contato e imagens principais. A proposta utiliza seções definidas, com identidade da Ideali e boa legibilidade; um editor livre de páginas não é necessário para essa entrega.

As solicitações de financiamento e captação poderão usar o formulário geral com assunto identificado. Não haverá cálculo de crédito ou promessa de aprovação de financiamento nesta etapa.

O novo site será preparado em endereço de teste. A decisão de manter o domínio atual depende da conferência de seu controle e de uma transição planejada, incluindo os endereços dos anúncios antigos.

## 8. Organização e proteção dos dados

Uma aplicação web atenderá celular e computador. O CRM terá acesso por login; o site será público. Ambos usarão a mesma base central, com uma versão específica dos dados que podem aparecer nos anúncios. Fotografias públicas e documentos privados terão regras de acesso próprias.

| Parte | Responsabilidade |
|---|---|
| Equipe e acesso | Contas, perfis, sessões e permissões. |
| Catálogo | Imóveis, disponibilidade, responsáveis, fotografias e documentos. |
| Publicação | Versões dos anúncios, prévia e retirada do site. |
| Relacionamento | Pessoas, solicitações recebidas e atendimentos. |
| Agenda | Próximas ações, tarefas e visitas. |
| Histórico e resultados | Registro de alterações e indicadores calculados dos fatos salvos. |

Dados salvos por uma pessoa devem estar disponíveis às demais autorizadas sem cópias manuais. Se duas pessoas editarem o mesmo registro, o sistema detecta a versão desatualizada e pede revisão antes de substituir o que foi salvo por outra pessoa.

Gravação de solicitação, atribuição e transferência precisam ter resultado consistente. O sistema só mostra sucesso depois de confirmar a gravação. Em falha de rede, preserva o que está sendo digitado enquanto a tela permanecer aberta e oferece nova tentativa. Uso sem internet não está incluído.

Login usa contas individuais e recuperação de acesso; não haverá cadastro público de corretores. Segredos ficam no servidor. Documentos privados exigem autorização para acesso, e backups deverão ter restauração verificada antes de dados reais entrarem em produção.

Fornecedor de hospedagem, banco, armazenamento e custos serão escolhidos no plano técnico. Esta proposta define responsabilidades e comportamento, sem pressupor um serviço contratado. O CRM Marte permanece um projeto separado; integração com ele depende de outro desenho.

## 9. Entregas e limites

O projeto será dividido em partes revisáveis. Cada parte terá um plano de construção e critérios de teste próprios.

| Parte | Entrega concreta |
|---|---|
| 1. Equipe e catálogo | Login, usuários, permissões e cadastro de imóveis, com rascunho e fotos. |
| 2. Publicação e site | Prévia, publicação, busca pública, ficha do imóvel e recepção de solicitações. |
| 3. Atendimento diário | Carteiras, atribuição de solicitações, funil, ficha, tarefas, visitas e tela Hoje. |
| 4. Piloto e transição | Indicadores básicos, teste com a equipe, conferência de migração e preparação para troca do site. |

Os indicadores iniciais serão: solicitações aguardando responsável, atendimentos abertos por etapa, tarefas atrasadas e atendimentos ganhos/perdidos no período, com filtro de responsável para o gestor. Sempre calculados a partir dos registros, sem números demonstrativos misturados aos dados reais.

Esta proposta começa pela intermediação de vendas, conforme o fluxo e o site observados. Locações e administração de aluguéis precisam de definição própria. Também são evoluções separadas: portais de terceiros, rodízio automático, WhatsApp com histórico integrado, comissões/financeiro, assinatura de contratos, aplicativo nativo, uso sem internet e integração com o CRM Marte.

Essa delimitação é proposta, não uma afirmação de que a Ideali dispensa esses recursos. Se algum for indispensável à rotina atual, ele precisa entrar no planejamento antes de substituir o Praedium.

## 10. Migração, operação e economia

A importação depende de obter uma amostra de exportação do Praedium. O trabalho será: mapear campos; conferir códigos e fotos; preservar relações e históricos disponíveis; importar uma amostra em ambiente de teste; validar com a equipe; então planejar a carga final. Não há garantia de que todo histórico possa ser exportado até essa verificação.

Nenhuma substituição será feita apenas porque as telas estiverem prontas. Antes da troca: critérios de aceitação atendidos, dados conferidos, cópia de segurança e restauração testada, controle do domínio verificado, hospedagem definida e responsáveis pela manutenção combinados. A transição deve definir onde a equipe registra novas informações para evitar duas bases divergentes.

O comparativo de custo incluirá serviço atual, hospedagem, banco, fotos/documentos, mensagens ou serviços externos contratados, backups e manutenção. Ainda não há informação suficiente para prometer economia, preço mensal ou prazo de entrega.

## 11. Como verificar que a primeira versão atende

1. Um corretor entra e encontra retornos atrasados, retornos de hoje e visitas em grupos distintos, com acesso direto à ficha.
2. No celular e no computador, consegue cadastrar um interessado, consultar imóvel, mudar etapa e agendar retorno sem instruções do desenvolvedor. Um piloto com pelo menos dois corretores, usando dados fictícios, deve registrar onde houver dúvida ou impedimento.
3. Um imóvel incompleto pode ser salvo como rascunho; o sistema informa exatamente o que falta para publicá-lo.
4. Salvar uma mudança de preço não altera o site silenciosamente. A prévia e o indicador de alterações pendentes permitem conferir o que vai ser publicado.
5. Após publicação, o anúncio mostra apenas os campos públicos. Testes com endereço direto e acesso sem login não revelam documentos, proprietário ou observações internas.
6. Qualquer situação diferente de disponível retira a oferta pública, inclusive rascunho. Voltar a disponível exige republicação explícita.
7. Uma solicitação do site aparece na fila do gestor com origem e imóvel, quando houver. Nova tentativa do mesmo envio não duplica a solicitação; envios distintos não são mesclados sem revisão.
8. O gestor atribui um interessado; o corretor designado passa a vê-lo. Outro corretor não obtém os dados por lista, busca, link direto ou anexo.
9. Dois atendimentos da mesma pessoa mantêm imóveis, etapas e históricos próprios. Encerrar um preserva o outro aberto.
10. Transferir um cliente move os vínculos previstos e recalcula os acessos; o registro da transferência permanece. Desativar um usuário encerra suas sessões e exige destino para os registros sob sua responsabilidade. Desativação e mudança de perfil não podem deixar a equipe sem gestor ativo.
11. Uma falha de gravação não mostra confirmação falsa nem apaga os campos digitados da tela. Edições concorrentes não se sobrescrevem sem aviso.
12. É possível adicionar o décimo segundo integrante pelo gestor. Limites operacionais serão medidos no ambiente escolhido; a aplicação não terá uma trava fixa em 11 usuários.

Esses são critérios de teste futuros. Até aqui, foi feita análise e elaboração da proposta, sem código do produto, testes de implementação ou alteração no Praedium.
