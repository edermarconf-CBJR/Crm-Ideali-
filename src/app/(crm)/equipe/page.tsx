import { atorPagina } from "@/acesso/pagina";
import { exigirGestor } from "@/acesso/ator";
import { redirect } from "next/navigation";
import { banco } from "@/servidor/banco";
import Equipe from "./acoes";
export default async function Pagina() {
  const a = await atorPagina();
  if (a.perfil !== "gestor") redirect("/imoveis");
  exigirGestor(a);
  const r = await banco.query(
    'SELECT m.id,u.name AS nome,u.email,m.perfil,m.estado,m.versao,(SELECT count(*)::int FROM imoveis i WHERE i.responsavel_id=m.id) AS quantidade FROM membros m JOIN "user" u ON u.id=m.id ORDER BY u.name',
  );
  return <Equipe inicial={r.rows} atorId={a.id} />;
}
