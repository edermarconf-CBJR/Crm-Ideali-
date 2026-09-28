function identidade(valor) {
  const u = new URL(valor);
  return u.hostname + ":" + (u.port || "5432") + u.pathname;
}
export function verificarBancoTeste(
  valor = process.env.DATABASE_URL,
  operacional = process.env.CRM_BANCO_OPERACIONAL,
) {
  if (!valor) throw new Error("Banco isolado de testes não configurado.");
  let u;
  try {
    u = new URL(valor);
  } catch {
    throw new Error("Banco isolado de testes inválido.");
  }
  if (!decodeURIComponent(u.pathname).endsWith("_teste"))
    throw new Error(
      "Os testes exigem banco isolado com nome terminado em _teste.",
    );
  if (operacional && identidade(valor) === identidade(operacional))
    throw new Error(
      "O banco isolado de testes deve ser diferente do operacional.",
    );
  return valor;
}
export function definirAmbienteTeste() {
  const operacional =
    process.env.CRM_BANCO_OPERACIONAL ?? process.env.DATABASE_URL;
  const destino = verificarBancoTeste(
    process.env.TEST_DATABASE_URL,
    operacional,
  );
  if (operacional) process.env.CRM_BANCO_OPERACIONAL = operacional;
  process.env.DATABASE_URL = destino;
}
