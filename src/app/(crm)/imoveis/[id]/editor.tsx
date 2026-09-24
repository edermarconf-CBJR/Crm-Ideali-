"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Campo, Aviso } from "@/componentes/campo";
import {
  tiposTexto,
  situacoesTexto,
  preco,
} from "@/compartilhado/apresentacao";
import { camposIniciais } from "@/imoveis/padroes";
import { moedaParaCentavos, camposSchema } from "@/imoveis/validacao";
import type {
  ImovelDetalhe,
  DadosInternos,
  Historico,
} from "@/compartilhado/contratos";
import Arquivos from "./fotos";
import { ZodError } from "zod";
const moedas = ["precoCentavos", "condominioCentavos", "iptuAnualCentavos"];
const inteiros = ["quartos", "banheiros", "vagas"];
const areas = ["areaPrivativa", "areaTotal"];
const obrigatorios = ["tipo", "cidade"];
const rotulos: Record<string, string> = {
  tipo: "Tipo do imóvel",
  cidade: "Cidade",
  bairro: "Bairro",
  precoCentavos: "Preço de venda (R$)",
  quartos: "Quartos",
  banheiros: "Banheiros",
  vagas: "Vagas",
  areaPrivativa: "Área privativa (m²)",
  areaTotal: "Área total (m²)",
  titulo: "Título do anúncio",
  descricao: "Descrição",
  condominioCentavos: "Condomínio mensal (R$)",
  iptuAnualCentavos: "IPTU anual (R$)",
  caracteristicas: "Características (separadas por vírgula)",
  estagioObra: "Estágio da obra",
  entrega: "Previsão de entrega",
  condicoes: "Condições comerciais",
  endereco: "Endereço completo",
  proprietarioNome: "Nome do proprietário",
  proprietarioTelefone: "Telefone do proprietário",
  chaves: "Informações de chaves",
  observacoes: "Observações internas",
};
function formulario(i: ImovelDetalhe) {
  const r: Record<string, string> = {};
  for (const k of Object.keys(camposIniciais(i.tipo, i.cidade))) {
    const v = i[k as keyof ImovelDetalhe];
    r[k] =
      v === null
        ? ""
        : moedas.includes(k)
          ? (Number(v) / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : Array.isArray(v)
            ? v.join(", ")
            : String(v);
  }
  for (const [k, v] of Object.entries(i.internos ?? {})) r[k] = v ?? "";
  return r;
}
export default function Editor({
  inicial,
  gestor,
  equipe,
  novo,
}: {
  inicial: ImovelDetalhe;
  gestor: boolean;
  equipe: { id: string; nome: string }[];
  novo: boolean;
}) {
  const [i, setI] = useState(inicial);
  const [f, setF] = useState(() => formulario(inicial));
  const [aba, setAba] = useState(0);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState(novo ? "Rascunho salvo" : "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const [op, setOp] = useState(() => crypto.randomUUID());
  const [atual, setAtual] = useState<ImovelDetalhe | null>(null);
  const [destino, setDestino] = useState(inicial.responsavelId);
  const [historico, setHistorico] = useState<Historico[] | null>(null);
  function mudar(k: string, v: string) {
    setF((x) => ({ ...x, [k]: v }));
    setOp(crypto.randomUUID());
    setAviso("");
  }
  async function salvar(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setErro("");
    setErros({});
    try {
      const bruto: Record<string, unknown> = {};
      for (const k of Object.keys(camposIniciais(i.tipo, i.cidade))) {
        const v = f[k] ?? "";
        bruto[k] = moedas.includes(k)
          ? moedaParaCentavos(v)
          : inteiros.includes(k)
            ? v === ""
              ? null
              : Number(v)
            : areas.includes(k)
              ? v === ""
                ? null
                : v.replace(",", ".")
              : k === "sobConsulta"
                ? v === "true"
                : k === "caracteristicas"
                  ? v
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                  : obrigatorios.includes(k)
                    ? v
                    : v.trim() || null;
      }
      const internos = Object.fromEntries(
        [
          "endereco",
          "proprietarioNome",
          "proprietarioTelefone",
          "chaves",
          "observacoes",
        ].map((k) => [k, f[k]?.trim() || null]),
      ) as DadosInternos;
      const r = await fetch("/api/imoveis/" + i.id, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          operacaoId: op,
          versao: i.versao,
          campos: camposSchema.parse(bruto),
          internos,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErro(d.erro.mensagem);
        setErros(d.erro.campos ?? {});
        if (r.status === 409) {
          const rr = await fetch("/api/imoveis/" + i.id);
          if (rr.ok) setAtual(await rr.json());
        }
        return;
      }
      setI(d);
      setF(formulario(d));
      setOp(crypto.randomUUID());
      setAtual(null);
      setAviso("Alterações salvas");
    } catch (e) {
      if (e instanceof ZodError)
        setErros(
          Object.fromEntries(
            e.issues.map((x) => [
              "campos." + x.path.join("."),
              "Confira este valor. Use um número válido dentro dos limites.",
            ]),
          ),
        );
      setErro(
        e instanceof Error && e.name === "ZodError"
          ? "Confira os valores preenchidos antes de salvar."
          : e instanceof Error && e.name === "ErroDominio"
            ? e.message
            : "Não foi possível confirmar o salvamento. Seus dados continuam nesta tela.",
      );
    } finally {
      setOcupado(false);
    }
  }
  async function acao(sufixo: string, corpo: object) {
    setOcupado(true);
    setErro("");
    try {
      const r = await fetch("/api/imoveis/" + i.id + "/" + sufixo, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          operacaoId: crypto.randomUUID(),
          versao: i.versao,
          ...corpo,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErro(d.erro.mensagem);
        return;
      }
      setI(d);
      setAviso("Alteração salva");
    } catch {
      setErro(
        "Não foi possível confirmar. Atualize a ficha antes de tentar novamente.",
      );
    } finally {
      setOcupado(false);
    }
  }
  function campo(k: string, longo = false, amplo = false) {
    return (
      <Campo
        key={k}
        rotulo={rotulos[k]}
        name={k}
        value={f[k] ?? ""}
        onChange={(e) => mudar(k, e.target.value)}
        longo={longo}
        amplo={amplo}
        required={obrigatorios.includes(k)}
        disabled={!i.podeEditar || ocupado}
        erro={erros["campos." + k] ?? erros["internos." + k]}
        opcoes={
          k === "tipo"
            ? Object.entries(tiposTexto).map(([valor, texto]) => ({
                valor,
                texto,
              }))
            : undefined
        }
        inputMode={
          moedas.includes(k) || areas.includes(k)
            ? "decimal"
            : inteiros.includes(k)
              ? "numeric"
              : undefined
        }
      />
    );
  }
  return (
    <>
      <Link className="voltar" href="/imoveis">
        ← Voltar aos imóveis
      </Link>
      <div className="cabecalho-pagina">
        <div>
          <p className="eyebrow">
            {i.codigo} · {tiposTexto[i.tipo]}
          </p>
          <h1>{i.titulo || tiposTexto[i.tipo] + " em " + i.cidade}</h1>
          <p className="muted">
            {[i.bairro, i.cidade].filter(Boolean).join(" · ")} ·{" "}
            {preco(i.precoCentavos, i.sobConsulta)}
          </p>
        </div>
        <span className={"selo estatico " + i.situacao}>
          {situacoesTexto[i.situacao]}
        </span>
      </div>
      <Aviso erro={erro} avisos={aviso} />
      {atual && (
        <section className="conflito">
          <h2>Confira o que mudou</h2>
          <dl>
            {Object.keys(rotulos)
              .filter((k) => formulario(atual)[k] !== f[k])
              .map((k) => (
                <div key={k}>
                  <dt>{rotulos[k]}</dt>
                  <dd>Salvo: {formulario(atual)[k] || "Não informado"}</dd>
                  <dd>Seu preenchimento: {f[k] || "Não informado"}</dd>
                </div>
              ))}
          </dl>
          <p>Escolha antes de tentar salvar novamente.</p>
          <button
            type="button"
            className="secundario"
            onClick={() => {
              setI(atual);
              setF(formulario(atual));
              setAtual(null);
              setErro("");
              setOp(crypto.randomUUID());
            }}
          >
            Carregar os dados salvos
          </button>
          <button
            type="button"
            className="secundario"
            onClick={() => {
              setI(atual);
              setAtual(null);
              setErro("");
              setOp(crypto.randomUUID());
              setAviso(
                "Seu preenchimento foi mantido. Revise e clique em Salvar alterações.",
              );
            }}
          >
            Manter meu preenchimento
          </button>
        </section>
      )}
      <div className="abas" aria-label="Partes do cadastro">
        {["O imóvel", "Fotos e anúncio", "Detalhes"].map((nome, n) => (
          <button
            key={nome}
            type="button"
            className={aba === n ? "selecionada" : ""}
            onClick={() => setAba(n)}
          >
            <span>0{n + 1}</span>
            {nome}
          </button>
        ))}
      </div>
      <form className="painel editor" onSubmit={salvar}>
        {aba === 0 && (
          <>
            <h2>Informações do imóvel</h2>
            <p className="muted">
              Preencha o que já sabe. Campos sem informação podem ficar em
              branco.
            </p>
            <div className="campos">
              {["tipo", "cidade", "bairro", "precoCentavos"].map((k) =>
                campo(k),
              )}
              <label className="checkbox amplo">
                <input
                  type="checkbox"
                  checked={f.sobConsulta === "true"}
                  onChange={(e) =>
                    mudar("sobConsulta", String(e.target.checked))
                  }
                  disabled={!i.podeEditar}
                />{" "}
                Preço sob consulta
              </label>
              {[
                "quartos",
                "banheiros",
                "vagas",
                "areaPrivativa",
                "areaTotal",
              ].map((k) => campo(k))}
            </div>
            {i.podeEditar && (
              <section className="dados-internos">
                <div className="subtitulo">
                  <h2>Informações internas</h2>
                  <span className="etiqueta">Acesso restrito</span>
                </div>
                <p className="muted">
                  Visíveis apenas ao responsável e aos gestores.
                </p>
                <div className="campos">
                  {campo("endereco", false, true)}
                  {campo("proprietarioNome")}
                  {campo("proprietarioTelefone")}
                </div>
              </section>
            )}
          </>
        )}
        {aba === 1 && (
          <>
            <Arquivos imovel={i} categoria="foto" atualizar={setI} />
            <div className="divisor" />
            <h2>Conteúdo do anúncio</h2>
            <p className="muted">
              Prepare o texto do imóvel. A publicação no site entra na próxima
              entrega.
            </p>
            <div className="campos">
              {campo("titulo", false, true)}
              {campo("descricao", true, true)}
            </div>
          </>
        )}
        {aba === 2 && (
          <>
            <h2>Mais detalhes</h2>
            <div className="campos">
              {[
                "condominioCentavos",
                "iptuAnualCentavos",
                "estagioObra",
                "entrega",
              ].map((k) => campo(k))}
              {campo("caracteristicas", false, true)}
              {campo("condicoes", true, true)}
              {i.podeEditar && (
                <>
                  {campo("chaves", true, true)}
                  {campo("observacoes", true, true)}
                </>
              )}
            </div>
            {i.podeEditar && (
              <>
                <div className="divisor" />
                <Arquivos imovel={i} categoria="documento" atualizar={setI} />
              </>
            )}
          </>
        )}
        {i.podeEditar && (
          <div className="acoes-form">
            <span className="muted">
              As alterações são salvas neste cadastro.
            </span>
            <button className="primario" disabled={ocupado || !!atual}>
              {ocupado ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        )}
      </form>
      {i.podeEditar && (
        <section className="painel operacao">
          <div>
            <h2>Disponibilidade</h2>
            <p className="muted">
              Mantenha a equipe informada sobre a situação do imóvel.
            </p>
            <Campo
              rotulo="Situação comercial"
              name="situacao"
              value={i.situacao}
              disabled={ocupado}
              onChange={(e) => acao("situacao", { situacao: e.target.value })}
              opcoes={Object.entries(situacoesTexto).map(([valor, texto]) => ({
                valor,
                texto,
              }))}
            />
          </div>
          {gestor && (
            <div>
              <h2>Responsável</h2>
              <Campo
                rotulo="Integrante responsável"
                name="responsavel"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                opcoes={equipe.map((m) => ({ valor: m.id, texto: m.nome }))}
              />
              <button
                type="button"
                className="secundario"
                disabled={ocupado || destino === i.responsavelId}
                onClick={() => acao("responsavel", { destinoId: destino })}
              >
                Transferir imóvel
              </button>
            </div>
          )}
          <div>
            <h2>Histórico</h2>
            <button
              type="button"
              className="secundario"
              onClick={async () => {
                const r = await fetch("/api/imoveis/" + i.id + "/historico");
                if (r.ok) setHistorico(await r.json());
              }}
            >
              Ver alterações
            </button>
            {historico && (
              <ul className="historico">
                {historico.map((h) => (
                  <li key={h.id}>
                    <strong>{h.acao}</strong>
                    <small>
                      {h.autorNome} ·{" "}
                      {new Date(h.data).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </>
  );
}
