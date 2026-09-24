import { test, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { criarCenario, senhaTeste, semearUsuario } from "../apoio/cenario";
import { banco } from "../../src/servidor/banco";
import { auth } from "../../src/acesso/auth";
import { convidarMembro } from "../../src/acesso/provisionar";
import { exigirAtor } from "../../src/acesso/ator";
afterAll(() => banco.end());
async function token(id: string) {
  return (
    await banco.query(
      "SELECT identifier FROM verification WHERE value=$1 AND identifier LIKE 'reset-password:%' ORDER BY \"createdAt\" DESC LIMIT 1",
      [id],
    )
  ).rows[0].identifier.slice(15) as string;
}
test("convite ativa uma vez; recuperação substitui link, vence e revoga sessões", async () => {
  const c = await criarCenario();
  try {
    const membro = await convidarMembro(
      { id: c.gestor.id, perfil: "gestor" },
      {
        operacaoId: randomUUID(),
        nome: "Convite fictício",
        email: randomUUID() + "@example.test",
        perfil: "corretor",
      },
    );
    const primeiro = await token(membro.id);
    await auth.api.requestPasswordReset({ body: { email: membro.email } });
    const segundo = await token(membro.id);
    expect(segundo).not.toBe(primeiro);
    await expect(
      auth.api.resetPassword({
        body: { token: primeiro, newPassword: senhaTeste },
      }),
    ).rejects.toBeDefined();
    await auth.api.resetPassword({
      body: { token: segundo, newPassword: senhaTeste },
    });
    expect(
      (await banco.query("SELECT estado FROM membros WHERE id=$1", [membro.id]))
        .rows[0].estado,
    ).toBe("ativo");
    await expect(
      auth.api.resetPassword({
        body: { token: segundo, newPassword: senhaTeste },
      }),
    ).rejects.toBeDefined();
    await auth.api.requestPasswordReset({ body: { email: c.corretorA.email } });
    const t = await token(c.corretorA.id);
    await auth.api.resetPassword({
      body: { token: t, newPassword: senhaTeste + "nova" },
    });
    await expect(
      exigirAtor(new Headers({ cookie: c.corretorA.cookie })),
    ).rejects.toMatchObject({ codigo: "NAO_AUTENTICADO" });
    await auth.api.requestPasswordReset({ body: { email: membro.email } });
    const vencido = await token(membro.id);
    await banco.query(
      "UPDATE verification SET \"expiresAt\"=now()-interval '1 hour' WHERE value=$1",
      [membro.id],
    );
    await expect(
      auth.api.resetPassword({
        body: { token: vencido, newPassword: senhaTeste },
      }),
    ).rejects.toBeDefined();
    await banco.query("UPDATE membros SET estado='inativo' WHERE id=$1", [
      membro.id,
    ]);
    await expect(
      auth.api.signInEmail({
        body: { email: membro.email, password: senhaTeste },
      }),
    ).rejects.toBeDefined();
  } finally {
    await c.limpar();
  }
});
test("a equipe pode crescer além de onze integrantes", async () => {
  const c = await criarCenario();
  try {
    for (let n = 0; n < 9; n++) await semearUsuario();
    expect(
      Number((await banco.query("SELECT count(*) FROM membros")).rows[0].count),
    ).toBe(12);
  } finally {
    await c.limpar();
  }
});
