import "./copia-apoio";
import { randomBytes, randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
const { banco } = await import("../src/servidor/banco");
const { auth } = await import("../src/acesso/auth");
const { criarImovel, salvarImovel, trocarSituacao } =
  await import("../src/imoveis/gravacao");
if (
  !["127.0.0.1", "localhost"].includes(
    new URL(process.env.APP_ORIGIN!).hostname,
  )
)
  throw new Error("Demonstração somente local.");
try {
  if (Number((await banco.query("SELECT count(*) FROM membros")).rows[0].count))
    throw new Error(
      "Demonstração exige base vazia. Dados existentes foram preservados.",
    );
  const senha = "Demo-" + randomBytes(15).toString("base64url");
  const membros = [];
  for (const [nome, email, perfil] of [
    ["Gestor de demonstração", "gestor@ideali.example.test", "gestor"],
    ["Corretora Ana — fictícia", "ana@ideali.example.test", "corretor"],
    ["Corretor Bruno — fictício", "bruno@ideali.example.test", "corretor"],
  ] as const) {
    const { user } = await auth.api.createUser({
      body: { name: nome, email, password: senha, role: "user" },
    });
    await banco.query(
      "INSERT INTO membros(id,perfil,estado) VALUES($1,$2,'ativo')",
      [user.id, perfil],
    );
    membros.push({ id: user.id, perfil });
  }
  for (let n = 0; n < 6; n++) {
    const a = membros[n % 3];
    let i = await criarImovel(a, {
      operacaoId: randomUUID(),
      tipo: n % 3 === 0 ? "casa" : n % 3 === 1 ? "apartamento" : "terreno",
      cidade: "Cidade Exemplo",
    });
    i = await salvarImovel(a, i.id, {
      operacaoId: randomUUID(),
      versao: i.versao,
      campos: {
        ...(Object.fromEntries(
          Object.keys(
            (await import("../src/imoveis/padroes")).camposIniciais(
              i.tipo,
              i.cidade,
            ),
          ).map((k) => [k, i[k as keyof typeof i]]),
        ) as typeof i),
        titulo: [
          "Casa Jardim — exemplo fictício",
          "Apartamento Centro — exemplo fictício",
          "Terreno Parque — exemplo fictício",
        ][n % 3],
        bairro: ["Jardim", "Centro", "Parque"][n % 3],
        precoCentavos: 25000000 + n * 2500000,
        quartos: n % 3 === 2 ? null : 2,
        vagas: 1,
      },
      internos: i.internos!,
    });
    if (n !== 5)
      await trocarSituacao(a, i.id, {
        operacaoId: randomUUID(),
        versao: i.versao,
        situacao: n === 4 ? "reservado" : "disponivel",
      });
  }
  await mkdir(".dados", { recursive: true });
  await writeFile(
    ".dados/acesso-demonstracao.txt",
    "CRM Ideali — somente demonstração local\n\nEndereço: http://127.0.0.1:3100\nGestor: gestor@ideali.example.test\nCorretora: ana@ideali.example.test\nCorretor: bruno@ideali.example.test\nSenha fictícia destes acessos: " +
      senha +
      "\n\nTodos os nomes, imóveis e valores são fictícios. Não usar estes acessos em produção.\n",
  );
  console.log(
    "Demonstração criada; acessos em .dados/acesso-demonstracao.txt.",
  );
} finally {
  await banco.end();
}
