import { notFound } from "next/navigation";
import { atorPagina } from "@/acesso/pagina";
import { obterImovel } from "@/imoveis/consulta";
import { banco } from "@/servidor/banco";
import { ErroDominio } from "@/compartilhado/erros";
import Editor from "./editor";
export default async function Pagina({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  const a = await atorPagina();
  const i = await obterImovel(a, (await params).id).catch((e) => {
    if (e instanceof ErroDominio && e.codigo === "NAO_ENCONTRADO") notFound();
    throw e;
  });
  const equipe =
    a.perfil === "gestor"
      ? (
          await banco.query(
            "SELECT m.id,u.name AS nome FROM membros m JOIN \"user\" u ON u.id=m.id WHERE estado='ativo' ORDER BY u.name",
          )
        ).rows
      : [];
  return (
    <Editor
      inicial={i}
      gestor={a.perfil === "gestor"}
      equipe={equipe}
      novo={(await searchParams).novo === "1"}
    />
  );
}
