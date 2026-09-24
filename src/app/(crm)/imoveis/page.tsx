import { banco } from "@/servidor/banco";
import Link from "next/link";
import { atorPagina } from "@/acesso/pagina";
import { listarImoveis } from "@/imoveis/consulta";
import {
  tiposTexto,
  situacoesTexto,
  preco,
} from "@/compartilhado/apresentacao";
import type { FiltroImoveis } from "@/compartilhado/contratos";
export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const a = await atorPagina();
  const filtros = await searchParams;
  const integrantes = (
    await banco.query(
      'SELECT m.id,u.name AS nome FROM membros m JOIN "user" u ON u.id=m.id ORDER BY u.name',
    )
  ).rows;
  const dados = await listarImoveis(a, {
    ...filtros,
    pagina: Number(filtros.pagina ?? 1),
  } as FiltroImoveis);
  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <p className="eyebrow">CATÁLOGO DA EQUIPE</p>
          <h1>Imóveis</h1>
          <p className="muted">
            Encontre oportunidades. Cuide de cada detalhe.
          </p>
        </div>
        <Link className="primario" href="/imoveis/novo">
          ＋ Novo imóvel
        </Link>
      </div>
      <form className="filtros">
        <div className="busca">
          <label htmlFor="busca">Buscar no catálogo</label>
          <input
            id="busca"
            name="busca"
            defaultValue={filtros.busca}
            placeholder="Código, título, bairro ou cidade"
          />
        </div>
        <div>
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" defaultValue={filtros.tipo ?? ""}>
            <option value="">Todos os tipos</option>
            {Object.entries(tiposTexto).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="situacao">Situação</label>
          <select
            id="situacao"
            name="situacao"
            defaultValue={filtros.situacao ?? ""}
          >
            <option value="">Todas as situações</option>
            {Object.entries(situacoesTexto).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button className="secundario">Buscar</button>
        <Link className="limpar" href="/imoveis">
          Limpar
        </Link>
        <details className="mais-filtros">
          <summary>Mais filtros</summary>
          <div className="campos">
            <div>
              <label htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                name="cidade"
                defaultValue={filtros.cidade}
                maxLength={120}
              />
            </div>
            <div>
              <label htmlFor="bairro">Bairro</label>
              <input
                id="bairro"
                name="bairro"
                defaultValue={filtros.bairro}
                maxLength={120}
              />
            </div>
            <div>
              <label htmlFor="responsavelId">Responsável</label>
              <select
                id="responsavelId"
                name="responsavelId"
                defaultValue={filtros.responsavelId ?? ""}
              >
                <option value="">Toda a equipe</option>
                {integrantes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </form>
      <div className="linha-resultados">
        <strong>
          {dados.total}{" "}
          {dados.total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </strong>
        <span>Atualizados recentemente</span>
      </div>
      {dados.itens.length ? (
        <div className="grade-imoveis">
          {dados.itens.map((i) => (
            <Link
              className="cartao-imovel"
              key={i.id}
              href={"/imoveis/" + i.id}
            >
              <div className="foto-cartao">
                {i.capaId ? (
                  <img alt="" src={"/api/arquivos/" + i.capaId} />
                ) : (
                  <div className="sem-foto">
                    <span>⌂</span>Sem foto
                  </div>
                )}
                <span className={"selo " + i.situacao}>
                  {situacoesTexto[i.situacao]}
                </span>
                <span className="codigo">{i.codigo}</span>
              </div>
              <div className="cartao-corpo">
                <small>{tiposTexto[i.tipo]}</small>
                <h2>{i.titulo || tiposTexto[i.tipo] + " em " + i.cidade}</h2>
                <p className="localizacao">
                  {[i.bairro, i.cidade].filter(Boolean).join(" · ")}
                </p>
                <div className="caracteristicas">
                  {i.quartos !== null && <span>{i.quartos} quartos</span>}
                  {i.vagas !== null && <span>{i.vagas} vagas</span>}
                  {i.areaPrivativa && <span>{i.areaPrivativa} m²</span>}
                </div>
                <div className="cartao-base">
                  <strong>{preco(i.precoCentavos, i.sobConsulta)}</strong>
                  <span>
                    {i.responsavelId === a.id ? "Você" : i.responsavelNome} ↗
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className="vazio">
          <span className="icone-vazio">⌂</span>
          <h2>
            {Object.keys(filtros).length
              ? "Nenhum imóvel com esses filtros"
              : "O catálogo começa por aqui"}
          </h2>
          <p>
            Cadastre o primeiro imóvel com apenas tipo e cidade.
            <br />
            Você pode completar os detalhes depois.
          </p>
          <Link className="primario" href="/imoveis/novo">
            Cadastrar imóvel
          </Link>
        </section>
      )}
      <div className="paginacao">
        {dados.pagina > 1 && (
          <Link
            className="secundario"
            href={
              "?" +
              new URLSearchParams({
                ...filtros,
                pagina: String(dados.pagina - 1),
              })
            }
          >
            Anterior
          </Link>
        )}
        {dados.pagina * 30 < dados.total && (
          <Link
            className="secundario"
            href={
              "?" +
              new URLSearchParams({
                ...filtros,
                pagina: String(dados.pagina + 1),
              })
            }
          >
            Próxima página
          </Link>
        )}
      </div>
    </>
  );
}
