"use client";
import { useState } from "react";
import type { ImovelDetalhe } from "@/compartilhado/contratos";
import { Aviso } from "@/componentes/campo";
export default function Arquivos({
  imovel,
  categoria,
  atualizar,
}: {
  imovel: ImovelDetalhe;
  categoria: "foto" | "documento";
  atualizar: (i: ImovelDetalhe) => void;
}) {
  const [fila, setFila] = useState<{ arquivo: File; op: string }[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const itens = categoria === "foto" ? imovel.fotos : imovel.documentos;
  async function enviar() {
    setOcupado(true);
    setErro("");
    let atual = imovel;
    try {
      for (const item of fila) {
        const p = new URLSearchParams({
          operacaoId: item.op,
          versao: String(atual.versao),
          categoria,
          nome: item.arquivo.name,
        });
        const r = await fetch("/api/imoveis/" + imovel.id + "/arquivos?" + p, {
          method: "POST",
          headers: {
            "content-type": item.arquivo.type || "application/octet-stream",
          },
          body: item.arquivo,
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.erro.mensagem);
        atual = d;
        atualizar(d);
        setFila((f) => f.filter((x) => x.op !== item.op));
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível enviar. Tente novamente.",
      );
    } finally {
      setOcupado(false);
    }
  }
  async function acao(url: string, body: object, metodo = "POST") {
    setOcupado(true);
    setErro("");
    try {
      const r = await fetch(url, {
        method: metodo,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          operacaoId: crypto.randomUUID(),
          versao: imovel.versao,
          ...body,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro.mensagem);
      atualizar(d);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setOcupado(false);
    }
  }
  function mover(pos: number, passo: number) {
    const ids = itens.map((f) => f.id);
    [ids[pos], ids[pos + passo]] = [ids[pos + passo], ids[pos]];
    void acao("/api/imoveis/" + imovel.id + "/fotos", {
      idsOrdenados: ids,
      capaId: imovel.capaId,
    });
  }
  return (
    <section>
      <div className="subtitulo">
        <h2>
          {categoria === "foto" ? "Fotos do imóvel" : "Documentos internos"}
        </h2>
        <span className="muted">
          {itens.length}/{categoria === "foto" ? 40 : 20}
        </span>
      </div>
      {imovel.podeEditar && (
        <div className="upload">
          <label htmlFor={"arquivos-" + categoria}>
            <strong>
              ＋ Escolher {categoria === "foto" ? "fotos" : "documentos"}
            </strong>
            <span>
              {categoria === "foto"
                ? "JPG, PNG ou WebP · até 15 MB por foto"
                : "PDF, JPG ou PNG · até 20 MB por arquivo"}
            </span>
          </label>
          <input
            id={"arquivos-" + categoria}
            type="file"
            accept={
              categoria === "foto"
                ? "image/jpeg,image/png,image/webp"
                : "application/pdf,image/jpeg,image/png"
            }
            multiple
            onChange={(e) =>
              setFila(
                Array.from(e.target.files ?? []).map((arquivo) => ({
                  arquivo,
                  op: crypto.randomUUID(),
                })),
              )
            }
            disabled={ocupado}
          />
          {fila.length > 0 && (
            <div>
              <p>
                {fila.length}{" "}
                {fila.length === 1
                  ? "arquivo selecionado"
                  : "arquivos selecionados"}
              </p>
              <button
                type="button"
                className="primario"
                onClick={enviar}
                disabled={ocupado}
              >
                {ocupado ? "Enviando…" : "Enviar arquivos"}
              </button>
            </div>
          )}
        </div>
      )}
      <Aviso erro={erro} />
      {categoria === "foto" ? (
        <div className="fotos-grade">
          {itens.map((f, n) => (
            <div className="foto-item" key={f.id}>
              <img
                src={"/api/arquivos/" + f.id}
                alt={"Foto " + (n + 1) + " do imóvel"}
              />
              {imovel.capaId === f.id && (
                <span className="selo disponivel">Capa</span>
              )}
              {imovel.podeEditar && (
                <div className="foto-acoes">
                  <button
                    type="button"
                    disabled={ocupado || n === 0}
                    onClick={() => mover(n, -1)}
                    aria-label={"Mover foto " + (n + 1) + " para antes"}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={ocupado || n === itens.length - 1}
                    onClick={() => mover(n, 1)}
                    aria-label={"Mover foto " + (n + 1) + " para depois"}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    disabled={ocupado || imovel.capaId === f.id}
                    onClick={() =>
                      acao("/api/imoveis/" + imovel.id + "/fotos", {
                        idsOrdenados: itens.map((x) => x.id),
                        capaId: f.id,
                      })
                    }
                  >
                    Usar capa
                  </button>
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => {
                      if (confirm("Remover esta foto do imóvel?"))
                        void acao("/api/arquivos/" + f.id, {}, "DELETE");
                    }}
                    aria-label={"Remover foto " + (n + 1)}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <ul className="documentos">
          {itens.map((f) => (
            <li key={f.id}>
              <a href={"/api/arquivos/" + f.id}>{f.nome} ↗</a>
              <span>{Math.ceil(f.tamanho / 1024)} KB</span>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  if (confirm("Remover este documento?"))
                    void acao("/api/arquivos/" + f.id, {}, "DELETE");
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
      {itens.length === 0 && (
        <p className="muted">
          {categoria === "foto"
            ? "Nenhuma foto adicionada."
            : "Nenhum documento adicionado."}
        </p>
      )}
    </section>
  );
}
