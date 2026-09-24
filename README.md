# CRM Ideali — Parte 1

Aplicação local em português para avaliar cadastro de imóveis e gestão da equipe. Next.js 16, React 19, Node 24, PostgreSQL 17, Better Auth e arquivos privados S3. A construção foi autorizada com revisão independente ao final.

## O que esta entrega cobre

Conta individual por convite, recuperação de acesso, perfis Gestor/Corretor, catálogo compartilhado, rascunho com tipo/cidade, informações internas restritas, fotos/capa/ordem, documentos, histórico, transferência e desativação com preservação dos vínculos. Não existe limite fixo de onze integrantes. Gravações usam versão e identificador de operação para evitar perda silenciosa ou duplicação em reenvio.

Site público, publicação, clientes, agenda, funil, portais, locação e financeiro pertencem às próximas partes. Esta versão não substitui o Praedium.

## Ambiente local

Requisitos: Node 24, PostgreSQL 17, SMTP de teste e servidor privado S3. Instale com `npm ci`; configure `.env.local` a partir do exemplo. A aplicação lê esse arquivo; scripts também o carregam. Nunca versione senhas, arquivos de clientes ou backups.

Nesta máquina o ambiente portátil está em `.dados`: PostgreSQL na porta 55432, SeaweedFS em 8333 e Mailpit em 1025/8025, ligados somente a 127.0.0.1. Inicie `node scripts/banco-local.mjs`, `node scripts/arquivos-local.mjs` e Mailpit antes do CRM. Os binários baixados não estão no pacote de código. O PostgreSQL é instalado pela dependência embedded-postgres; Mailpit e SeaweedFS são obtidos das distribuições oficiais. Não copie a pasta de dados com os serviços em execução.

Execute `npm run db:migrate` e `npm run build`; abra com `npm start` em http://127.0.0.1:3100. Para desenvolvimento, use `npm run dev`. O Dockerfile é uma alternativa de distribuição; o contêiner não foi executado nesta máquina sem Docker.

Em uma base vazia, `npm run acesso:gestor` cria o primeiro convite. Não existe cadastro público ou senha padrão. O link deve ser recebido na caixa configurada; nesta avaliação ele aparece no Mailpit local. Se o envio falhar após criar o cadastro, solicite nova recuperação na tela de entrada.

A demonstração usa exclusivamente dados fictícios: `npm run demonstracao`, somente em base vazia/local. Os acessos gerados ficam em `.dados/acesso-demonstracao.txt`, fora do pacote e do Git. Reiniciar preserva os dados; limpar o navegador não apaga os imóveis. Encerrar a aba antes de salvar descarta apenas o preenchimento ainda não enviado.

## Testes

`npm test` migra automaticamente a base definida em TEST_DATABASE_URL, que deve terminar em `_teste`. É destrutivo APENAS nessa base de teste. Nunca aponte TEST_DATABASE_URL para a base de uso.

Com PostgreSQL, S3 e Mailpit ativos: `npm run test:unidade`, `npm run test:integracao`. Para telas, abra `node scripts/servidor-testes.mjs` e execute `npm run test:telas`; requer Google Chrome instalado. Não execute a suíte de integração ao mesmo tempo que a de telas: ambas usam a base fictícia. Complete com `npm run typecheck`, `npm run lint` e `npm run build`.

## Backup e recuperação

Pare o CRM e confirme `CRM_MANUTENCAO=1` no ambiente do terminal. Configure PG_TOOLS_DIR para pg_dump/pg_restore 17.x. Execute `npm run backup -- --destino <pasta-nova>`. O comando bloqueia gravações enquanto copia o banco e objetos ativos; produz manifesto SHA-256. Guarde a pasta inteira em armazenamento restrito e criptografado, fora do computador de operação. Este ensaio não configura backup automático nem criptografia.

Restaure SOMENTE em uma base vazia separada: defina RESTORE_MODE=isolado e RESTORE_DATABASE_URL no ambiente e execute `npm run restaurar -- --origem <pasta> --bucket-destino restauracao-<nome-unico>`. Nunca informe credenciais nos argumentos. O comando confere hashes, recusa os destinos da origem, restaura banco e objetos e elimina sessões/links antigos. Falha na transferência de objetos deixa o destino incompleto; mantenha-o fora de uso e repita em um novo destino vazio. Não apaga nem substitui a origem.

O teste automatizado usa três integrantes, três imóveis, duas fotos, um documento e histórico, compara bytes e vínculos e exige zero sessões restauradas. Isso é ensaio fictício, não restauração validada de um acervo real.

Para manutenção, `npm run arquivos:limpar` lista apenas quantidade de objetos órfãos/removidos com mais de 24 horas no prefixo do banco. Com a aplicação parada e CRM_MANUTENCAO=1, acrescente `-- --aplicar` para removê-los. Retenção dos backups é decisão separada.

## Antes do uso real

Concluir avaliação com Eder e dois corretores; configurar hospedagem/HTTPS, e-mail real e armazenamento privado, cotar capacidade/custos, validar rotina de backups e monitoramento. Criar acessos individuais reais em uma base sem demonstração. Não houve publicação externa, migração de clientes, alteração do domínio ou cancelamento do Praedium.
