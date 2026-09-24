# Registro de execução

Eder escolheu a opção 2 em 23/09/2026: implementação concentrada no agente principal e revisão independente ao final. Plano aprovado para execução; não solicitar nova aprovação.

## Conferência das interfaces antes da tarefa 1

| Origem → consumidora | Contratos | Resultado |
|---|---|---|
| 1 → 2 | Ator, Membro, transacao, exigirAtor | Consistentes; esquema 002 inclui histórico e recibos |
| 1 → 3 | Ator, banco, erros | Consistentes |
| 1/2/3 → 4 | bloqueios, executarUmaVez, permissões | Consistentes; helper nasce na tarefa 2 |
| 1/3/4 → 5 | política, versão, idempotência | Consistentes; capa/arquivos só após migração 004 |
| 1/2/3/4 → 6 | membros, versão, transações | Consistentes; último gestor sob bloqueio sentinela |
| 2/3/4/5/6 → 7 | APIs, DTOs | Consistentes; componentes sem acesso direto ao banco |
| 1–7 → 8 | esquema e objetos | Restauração exige destino separado e revoga sessões |

Ruling: repositório novo e isolado em work/crm-ideali, branch parte-1 — não existe branch principal anterior a proteger; custo se errado: mover projeto, sem afetar outra aplicação.
Ruling: helpers da habilidade reconhecem cabeçalhos ingleses “Task”, mas o plano autorizado usa “Tarefa” — registrar brief e BASE localmente mantendo português; custo se errado: diferença apenas de automação de acompanhamento.

## Situação

- Tarefa 1: em execução; infraestrutura em verificação.
- Tarefas 2–8: pendentes.

Não há teste de produto concluído.

Tarefa 1: fundação verificada — 8/8 testes passaram; build Next e TypeScript passaram. Gateway teve 7 falhas observadas antes da implementação.
Ruling: PostgreSQL 17.10 portátil substitui o contêiner local ausente — banco real, isolado e ligado somente a 127.0.0.1; custo se errado: revisar inicialização local, sem mudar o modelo de produção.
Ruling: testes iniciais chamam os handlers HTTP reais com Requests e banco real; execução do navegador fica no conjunto Playwright — custo se errado: diferenças de transporte serão cobertas pelas jornadas do navegador.
Tarefa 2: em execução.
Tarefa 2: núcleo de convites testado (9/9 no conjunto, TypeScript sem erros). Telas e casos de recuperação serão concluídos antes do fechamento. Tarefa 3 em execução.
Tarefas 3–6: serviços de catálogo, gravação, arquivos e equipe implementados; conjunto 22/22 passou, TypeScript passou. Interfaces aguardam a tarefa 7 antes do fechamento.
Ruling: SeaweedFS 4.47 local usa API S3 privada no lugar do MinIO ausente — hash do binário oficial conferido, leitura anônima recusada no teste; custo se errado: trocar somente o serviço de teste, contrato S3 preservado.
Ruling: obterImovel recebe consulta opcional para reler alterações dentro da transação sem abrir conexão externa — evita ler dados ainda não confirmados; custo se errado: rever um parâmetro interno.
Tarefa 7: em execução; teste de entrada escrito antes da tela.

## Verificação em 24/09/2026

- Tarefas 1–6: serviços e telas integrados; 25/25 testes de unidade/integração passaram no conjunto de 12 arquivos, incluindo restauração e 12º integrante. Dois testes adicionais do limite JSON passaram isoladamente; conjunto ampliado será executado no fechamento.
- Tarefa 7: seis jornadas Playwright passaram (30,5 s), incluindo larguras 320/390/1440, login real, cadastro, falha de rede, conflito entre abas, foto, convite, transferência, desativação e saída. Capturas inspecionadas; isso não constitui avaliação humana da equipe.
- Tarefa 8: backup/restauração REAL passou com pg_dump/pg_restore 17.11, servidor PostgreSQL 17.10, três integrantes/imóveis, duas fotos, um documento, vínculos/histórico e sessões zeradas. README, Dockerfile, roteiro de avaliação e semente fictícia preparados. Empacotamento e revisão final pendentes.
- O cabeçalho anterior de situação é histórico do início; prevalece este registro de 24/09.

Ruling: responsabilidade inclui responsavelNome no DTO — necessário mostrar responsável no catálogo sem expor contatos; custo se errado: ajustar contrato interno antes da integração pública.
Ruling: ferramentas PostgreSQL 17.11 da distribuição oficial EDB fazem backup do servidor 17.10 — compatibilidade de mesma versão principal e restauração real confirmadas; custo se errado: alinhar ferramentas ao servidor. Hash calculado localmente, sem alegar hash independente publicado.
Ruling: testes de telas toleram 15 segundos por expectativa no servidor de desenvolvimento — compilação inicial passou de cinco segundos; custo se errado: regressões de latência exigem medição no piloto, ainda não coberta.
Ruling: Dockerfile é fornecido, mas Docker não foi executado nesta máquina — entrega verificada pelo servidor Node local; custo se errado: adaptação da imagem na preparação da hospedagem.
