"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Campo, Aviso } from "@/componentes/campo";
export default function FormularioAcesso({
  modo,
}: {
  modo: "entrar" | "recuperar" | "definir";
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const endpoint =
        modo === "entrar"
          ? "sign-in/email"
          : modo === "recuperar"
            ? "request-password-reset"
            : "reset-password";
      const body =
        modo === "entrar"
          ? { email, password: senha }
          : modo === "recuperar"
            ? { email, redirectTo: location.origin + "/definir-senha" }
            : {
                token: new URLSearchParams(location.search).get("token"),
                newPassword: senha,
              };
      const r = await fetch("/api/auth/" + endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        setErro(
          modo === "entrar"
            ? "Não foi possível entrar. Confira seu e-mail e sua senha."
            : modo === "definir"
              ? "Link inválido ou vencido. Solicite uma nova recuperação."
              : "Não foi possível concluir agora. Tente novamente.",
        );
        return;
      }
      if (modo === "entrar") location.assign("/imoveis");
      else
        setAviso(
          modo === "recuperar"
            ? "Se esse acesso estiver cadastrado, você receberá as instruções."
            : "Senha definida. Agora você pode entrar.",
        );
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="acesso">
      <section className="acesso-marca">
        <Link href="/entrar" className="marca">
          IDEALI<small>IMÓVEIS</small>
        </Link>
        <div className="acesso-frase">
          <span className="eyebrow">MAIS CLAREZA. MAIS PROXIMIDADE.</span>
          <h1>
            Espaço para
            <br />
            bons negócios.
          </h1>
          <p>
            Seus imóveis e sua equipe,
            <br />
            no mesmo lugar.
          </p>
        </div>
        <small>Relacionamentos que constroem histórias.</small>
      </section>
      <main className="acesso-form">
        <div>
          <span className="eyebrow">BEM-VINDO À IDEALI</span>
          <h2>
            {modo === "entrar"
              ? "Vamos começar?"
              : modo === "recuperar"
                ? "Recupere seu acesso"
                : "Defina sua senha"}
          </h2>
          <p className="muted">
            {modo === "entrar"
              ? "Entre com sua conta para continuar."
              : modo === "recuperar"
                ? "Informe o e-mail da sua conta individual."
                : "Escolha uma senha com pelo menos 12 caracteres."}
          </p>
          <form onSubmit={enviar}>
            {modo !== "definir" && (
              <Campo
                rotulo="E-mail"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            )}
            {modo !== "recuperar" && (
              <Campo
                rotulo={modo === "definir" ? "Nova senha" : "Senha"}
                name="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={modo === "definir" ? 12 : undefined}
                maxLength={128}
                autoComplete={
                  modo === "definir" ? "new-password" : "current-password"
                }
                required
              />
            )}
            <Aviso erro={erro} avisos={aviso} />
            <button className="primario largo" disabled={enviando}>
              {enviando
                ? "Aguarde…"
                : modo === "entrar"
                  ? "Entrar"
                  : modo === "recuperar"
                    ? "Enviar instruções"
                    : "Salvar senha"}
            </button>
          </form>
          <Link
            className="link-acesso"
            href={modo === "entrar" ? "/recuperar-acesso" : "/entrar"}
          >
            {modo === "entrar" ? "Esqueci minha senha" : "Voltar para entrar"}
          </Link>
          <p className="acesso-ajuda">
            Seu acesso é criado pelo gestor da equipe.
          </p>
        </div>
      </main>
    </div>
  );
}
