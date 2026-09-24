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
