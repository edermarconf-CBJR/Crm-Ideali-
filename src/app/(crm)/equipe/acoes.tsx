"use client";
import { useState, type FormEvent } from "react";
import { Campo, Aviso } from "@/componentes/campo";
import { Dialogo } from "@/componentes/dialogo";
import type { Membro } from "@/compartilhado/contratos";
type Pessoa = Membro & { quantidade: number };
export default function Equipe({
  inicial,
  atorId,
}: {
  inicial: Pessoa[];
  atorId: string;
}) {
  const [pessoas, setPessoas] = useState(inicial);
  const [convidar, setConvidar] = useState(false);
  const [alvo, setAlvo] = useState<Pessoa | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("corretor");
  const [destino, setDestino] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [op, setOp] = useState(() => crypto.randomUUID());
  async function atualizar() {
    const r = await fetch("/api/equipe");
    if (r.ok) setPessoas(await r.json());
  }
  async function enviar(url: string, corpo: object) {
    setOcupado(true);
    setErro("");
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const d = await r.json();
      if (!r.ok) {
        setErro(d.erro?.mensagem ?? "Não foi possível concluir.");
        return false;
      }
      await atualizar();
      setAviso("Alteração salva");
      return true;
    } catch {
      setErro("Não foi possível confirmar. Tente novamente.");
      return false;
    } finally {
      setOcupado(false);
    }
  }
  async function convite(e: FormEvent) {
    e.preventDefault();
    if (await enviar("/api/equipe", { operacaoId: op, nome, email, perfil })) {
      setConvidar(false);
      setNome("");
      setEmail("");
      setOp(crypto.randomUUID());
      setAviso(
        "Integrante convidado. O link foi entregue ao serviço de e-mail configurado.",
      );
    }
  }
  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <p className="eyebrow">GESTÃO DE ACESSOS</p>
          <h1>Uma equipe, mais possibilidades.</h1>
          <p className="muted">
            Cada pessoa com sua conta. Cada informação no lugar certo.
          </p>
        </div>
        <button
          className="primario"
          onClick={() => {
            setErro("");
            setConvidar(true);
          }}
        >
          ＋ Convidar integrante
        </button>
      </div>
      <Aviso erro={!convidar && !alvo ? erro : ""} avisos={aviso} />
      <div className="linha-resultados">
        <strong>
          {pessoas.filter((p) => p.estado === "ativo").length} integrantes
          ativos
        </strong>
        <span>Sem limite fixo de 11 pessoas</span>
      </div>
      <div className="equipe-lista">
        {pessoas.map((p) => (
          <article className="pessoa" key={p.id}>
            <span className="avatar">{p.nome.slice(0, 1)}</span>
            <div className="pessoa-nome">
              <h2>
                {p.nome}
                {p.id === atorId && <small> Você</small>}
              </h2>
              <span>{p.email}</span>
            </div>
            <div className="pessoa-perfil">
              <strong>{p.perfil === "gestor" ? "Gestor" : "Corretor"}</strong>
              <span>
                {p.estado === "ativo"
                  ? "Ativo"
                  : p.estado === "convidado"
                    ? "Convite pendente"
                    : "Inativo"}{" "}
                · {p.quantidade ?? 0} imóveis
              </span>
            </div>
            {p.estado !== "inativo" && (
              <div className="pessoa-acoes">
                <button
                  className="texto-botao"
                  disabled={ocupado}
                  onClick={() =>
                    enviar("/api/equipe/" + p.id + "/perfil", {
                      operacaoId: crypto.randomUUID(),
                      versao: p.versao,
                      perfil: p.perfil === "gestor" ? "corretor" : "gestor",
                    })
                  }
                >
                  {p.perfil === "gestor" ? "Tornar corretor" : "Tornar gestor"}
                </button>
                <button
                  className="texto-botao perigo"
                  disabled={ocupado}
                  onClick={() => {
                    setAlvo(p);
                    setDestino("");
                    setErro("");
                  }}
                >
                  Desativar
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {convidar && (
        <Dialogo titulo="Convidar integrante" fechar={() => setConvidar(false)}>
          <p className="muted">
            A pessoa receberá um link para definir a própria senha.
          </p>
          <form onSubmit={convite}>
            <Campo
              rotulo="Nome"
              name="nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setOp(crypto.randomUUID());
              }}
              required
            />
            <Campo
              rotulo="E-mail"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setOp(crypto.randomUUID());
              }}
              required
            />
            <Campo
              rotulo="Perfil"
              name="perfil"
              value={perfil}
              onChange={(e) => {
                setPerfil(e.target.value);
                setOp(crypto.randomUUID());
              }}
              opcoes={[
                {
                  valor: "corretor",
                  texto: "Corretor — sua carteira e catálogo compartilhado",
                },
                {
                  valor: "gestor",
                  texto: "Gestor — equipe e operação completa",
                },
              ]}
            />
            <Aviso erro={erro} />
            <button className="primario largo" disabled={ocupado}>
              {ocupado ? "Preparando…" : "Enviar convite"}
            </button>
          </form>
        </Dialogo>
      )}
      {alvo && (
        <Dialogo titulo="Desativar acesso" fechar={() => setAlvo(null)}>
          <p>
            <strong>{alvo.nome}</strong> perderá o acesso. O histórico será
            preservado.
          </p>
          <p>
            {alvo.quantidade ?? 0} imóveis serão transferidos na mesma operação.
          </p>
          <Campo
            rotulo="Transferir imóveis para"
            name="destino"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            opcoes={[
              { valor: "", texto: "Selecione um integrante ativo" },
              ...pessoas
                .filter((p) => p.id !== alvo.id && p.estado === "ativo")
                .map((p) => ({ valor: p.id, texto: p.nome })),
            ]}
          />
          <Aviso erro={erro} />
          <button
            className="primario largo"
            disabled={ocupado || ((alvo.quantidade ?? 0) > 0 && !destino)}
            onClick={async () => {
              if (
                await enviar("/api/equipe/" + alvo.id + "/desativar", {
                  operacaoId: crypto.randomUUID(),
                  versao: alvo.versao,
                  ...(destino ? { destinoId: destino } : {}),
                })
              ) {
                if (alvo.id === atorId) location.assign("/entrar");
                setAlvo(null);
              }
            }}
          >
            {ocupado ? "Transferindo…" : "Confirmar desativação"}
          </button>
        </Dialogo>
      )}
    </>
  );
}
