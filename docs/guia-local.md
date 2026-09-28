# CRM Ideali — como testar a primeira versão

Entrega local de 28/09/2026. Os cadastros são fictícios e servem para avaliar a rotina.

## Abrir e entrar

1. Abra a pasta **Documentos → Codex → CRM Ideali**.
2. Dê dois cliques em **Abrir CRM Ideali.cmd**. Aguarde a tela de entrada.
3. Dê dois cliques em **Ver acessos de demonstracao.cmd**. Ele abre o arquivo privado que contém os três acessos e a senha de demonstração.
4. Comece pelo acesso de gestor. Depois, use Ana ou Bruno para experimentar a visão de um corretor.

Com o sistema aberto, o endereço é http://127.0.0.1:3100. Esta demonstração funciona neste computador. As telas se adaptam ao celular, mas o acesso de outros aparelhos depende da futura configuração de hospedagem.

## O que experimentar

- **Imóveis:** buscar e filtrar; abrir a ficha; criar rascunho apenas com tipo e cidade.
- **Cadastro:** completar informações aos poucos e salvar. Um campo vazio continua sem informação; não vira preço ou quantidade zero.
- **Fotos:** selecionar, enviar, escolher capa e ordenar. As seleções permanecem ao mudar de aba dentro da ficha. Fechar ou recarregar a página exige selecioná-las novamente.
- **Informações internas:** endereço completo, proprietário e documentos são visíveis ao gestor e ao responsável atual.
- **Equipe:** convidar integrantes, mudar perfil, transferir imóveis e desativar um acesso preservando o histórico.
- **Edição simultânea:** se outra pessoa alterar a ficha, o CRM pede que você confira as diferenças antes de salvar.

Há seis imóveis de exemplo e três contas fictícias. Eles começam sem fotos; você pode anexar imagens de teste. O sistema permite mais integrantes, sem limite fixo de onze.

## Convites e recuperação de senha

Na tela de entrada, use **Esqueci minha senha**. Nesta demonstração, convites e mensagens ficam na caixa local de testes em http://127.0.0.1:8025. Eles não são enviados para a caixa de e-mail real. Use endereços fictícios ao testar convites.

## Fechar e voltar depois

Use **Sair** para encerrar sua sessão. Fechar a aba não desliga o CRM. Para encerrar a aplicação, abra **Fechar CRM Ideali.cmd**.

Os cadastros salvos ficam no banco local e permanecem após fechar o navegador ou reiniciar o computador. Ao ligar novamente, use **Abrir CRM Ideali.cmd**. Banco, arquivos e caixa de mensagens continuam em segundo plano após o atalho de fechamento; desligar o computador encerra esses serviços.

## Onde o projeto está guardado

- **Sistema:** aplicação, histórico de versões e ambiente local.
- **Documentos:** proposta, plano, este guia e roteiro de avaliação.
- **Entregas:** pacote do código da Parte 1, sem senhas nem banco de dados.

O pacote de código não é uma cópia de segurança dos cadastros. O procedimento de backup/restauração está em Sistema/README.md; a restauração já foi ensaiada com dados fictícios.

## Avaliação da equipe e etapas seguintes

Peça a dois corretores que façam o roteiro de avaliação e registrem onde precisaram de ajuda. Essa avaliação humana ainda está pendente.

Esta entrega cobre a Parte 1: acesso, equipe e imóveis. Site público integrado, publicação, clientes, funil e agenda serão construídos nas próximas partes. O Praedium e o site atual continuam sendo os sistemas da operação.

Antes de usar dados reais, ainda são necessários hospedagem com acesso seguro, e-mail real, rotina de backup e avaliação com a equipe.
