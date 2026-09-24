import { atorPagina } from "@/acesso/pagina";
import { banco } from "@/servidor/banco";
import { Navegacao } from "@/componentes/navegacao";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const a = await atorPagina();
  const nome = (
    await banco.query('SELECT name FROM "user" WHERE id=$1', [a.id])
  ).rows[0].name;
  return (
    <div className="aplicacao">
      <a className="pular" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Navegacao gestor={a.perfil === "gestor"} nome={nome} />
      <div className="corpo">
        <header className="topo">
          <span>CRM IDEALI</span>
          <span className="topo-nota">
            <i /> Ambiente local · avaliação
          </span>
        </header>
        <main id="conteudo">{children}</main>
        <footer className="rodape">
          Ideali Imóveis <span>O seu próximo negócio começa aqui.</span>
        </footer>
      </div>
    </div>
  );
}
