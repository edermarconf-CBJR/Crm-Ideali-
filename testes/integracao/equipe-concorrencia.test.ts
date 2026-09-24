import { test, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { criarCenario, semearGestor } from "../apoio/cenario";
import { banco } from "../../src/servidor/banco";
import { alterarPerfil, desativarMembro } from "../../src/equipe/servico";
import { criarImovel } from "../../src/imoveis/gravacao";
import { exigirAtor } from "../../src/acesso/ator";
afterAll(() => banco.end());
test("concorrência não rebaixa os dois últimos gestores", async () => {
  const c = await criarCenario();
  try {
    const segundo = await semearGestor();
    const resultados = await Promise.allSettled(
      [c.gestor, segundo].map((s) =>
        alterarPerfil({ id: s.id, perfil: "gestor" }, s.id, {
          operacaoId: randomUUID(),
          versao: 1,
          perfil: "corretor",
        }),
      ),
    );
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(
      Number(
        (
          await banco.query(
            "SELECT count(*) FROM membros WHERE perfil='gestor' AND estado='ativo'",
          )
        ).rows[0].count,
      ),
    ).toBe(1);
  } finally {
    await c.limpar();
  }
});
test("desativação transfere imóveis e invalida sessão antiga", async () => {
  const c = await criarCenario();
  try {
    const i = await criarImovel(
      { id: c.corretorA.id, perfil: "corretor" },
      { operacaoId: randomUUID(), tipo: "casa", cidade: "Teste" },
    );
    await desativarMembro(
      { id: c.gestor.id, perfil: "gestor" },
      c.corretorA.id,
      { operacaoId: randomUUID(), versao: 1, destinoId: c.corretorB.id },
    );
    expect(
      (
        await banco.query("SELECT responsavel_id FROM imoveis WHERE id=$1", [
          i.id,
        ])
      ).rows[0].responsavel_id,
    ).toBe(c.corretorB.id);
    await expect(
      exigirAtor(new Headers({ cookie: c.corretorA.cookie })),
    ).rejects.toMatchObject({ codigo: "NAO_AUTENTICADO" });
    expect(
      Number(
        (
          await banco.query(
            'SELECT count(*) FROM "session" WHERE "userId"=$1',
            [c.corretorA.id],
          )
        ).rows[0].count,
      ),
    ).toBe(0);
  } finally {
    await c.limpar();
  }
});
test("falha na desativação reverte a transferência", async () => {
  const c = await criarCenario();
  try {
    const i = await criarImovel(
      { id: c.corretorA.id, perfil: "corretor" },
      { operacaoId: randomUUID(), tipo: "casa", cidade: "Teste" },
    );
    await banco.query(
      "CREATE FUNCTION falhar_desativacao() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.estado='inativo' THEN RAISE EXCEPTION 'falha sintética'; END IF; RETURN NEW; END $$",
    );
    await banco.query(
      "CREATE TRIGGER falha_teste BEFORE UPDATE ON membros FOR EACH ROW EXECUTE FUNCTION falhar_desativacao()",
    );
    await expect(
      desativarMembro({ id: c.gestor.id, perfil: "gestor" }, c.corretorA.id, {
        operacaoId: randomUUID(),
        versao: 1,
        destinoId: c.corretorB.id,
      }),
    ).rejects.toThrow();
    expect(
      (
        await banco.query("SELECT responsavel_id FROM imoveis WHERE id=$1", [
          i.id,
        ])
      ).rows[0].responsavel_id,
    ).toBe(c.corretorA.id);
  } finally {
    await banco.query("DROP TRIGGER IF EXISTS falha_teste ON membros");
    await banco.query("DROP FUNCTION IF EXISTS falhar_desativacao()");
    await c.limpar();
  }
});
