"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Campo, Aviso } from "@/componentes/campo";
import { tiposTexto } from "@/compartilhado/apresentacao";
export default function Novo() {
  const [tipo, setTipo] = useState("casa");
  const [cidade, setCidade] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [op, setOp] = useState(() => crypto.randomUUID());
  async function salvar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const r = await fetch("/api/imoveis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operacaoId: op, tipo, cidade }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErro(d.erro?.mensagem ?? "Confira os campos.");
        return;
      }
      location.assign("/imoveis/" + d.id + "?novo=1");
    } catch {
      setErro(
        "Não foi possível confirmar o salvamento. Seus dados continuam nesta tela.",
      );
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="coluna-form">
      <Link className="voltar" href="/imoveis">
        ← Voltar aos imóveis
      </Link>
      <div className="cabecalho-pagina">
        <div>
          <p className="eyebrow">UM NOVO COMEÇO</p>
          <h1>Novo imóvel</h1>
          <p className="muted">
            Comece pelo essencial. Os detalhes podem esperar.
          </p>
        </div>
      </div>
      <form className="painel" onSubmit={salvar}>
        <div className="titulo-painel">
          <span className="numero">01</span>
          <div>
            <h2>O essencial para começar</h2>
            <p>O imóvel será salvo como rascunho.</p>
          </div>
        </div>
        <div className="campos">
          <Campo
            rotulo="Tipo do imóvel"
            name="tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setOp(crypto.randomUUID());
            }}
            opcoes={Object.entries(tiposTexto).map(([valor, texto]) => ({
              valor,
              texto,
            }))}
            required
          />
          <Campo
            rotulo="Cidade"
            name="cidade"
            value={cidade}
            onChange={(e) => {
              setCidade(e.target.value);
              setOp(crypto.randomUUID());
            }}
            required
            minLength={2}
            maxLength={120}
          />
        </div>
        <Aviso erro={erro} />
        <div className="acoes-form">
          <Link href="/imoveis">Cancelar</Link>
          <button disabled={enviando} className="primario">
            {enviando ? "Salvando…" : "Salvar rascunho"}
          </button>
        </div>
      </form>
    </div>
  );
}
