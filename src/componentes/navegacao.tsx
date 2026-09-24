"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Navegacao({ gestor, nome }: { gestor: boolean; nome: string }) {
  const path = usePathname();
  async function sair() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    window.location.assign("/entrar");
  }
  return (
    <aside className="lateral">
      <Link href="/imoveis" className="marca">
        <span className="marca-simbolo">I</span>
        <span>
          IDEALI<small>IMÓVEIS</small>
        </span>
      </Link>
      <p className="menu-legenda">SEU ESPAÇO DE TRABALHO</p>
      <nav aria-label="Menu principal">
        <Link
          className={path.startsWith("/imoveis") ? "ativo" : ""}
          href="/imoveis"
        >
          <span aria-hidden="true">⌂</span> Imóveis
        </Link>
        {gestor && (
          <Link
            className={path.startsWith("/equipe") ? "ativo" : ""}
            href="/equipe"
          >
            <span aria-hidden="true">♧</span> Equipe
          </Link>
        )}
        <button
          className="sair sair-celular"
          onClick={sair}
          aria-label="Sair da conta"
        >
          Sair
        </button>
      </nav>
      <div className="lateral-rodape">
        <span className="avatar">{nome.slice(0, 1)}</span>
        <div>
          <strong>{nome}</strong>
          <small>{gestor ? "Gestor" : "Corretor"}</small>
        </div>
        <button className="sair" onClick={sair} aria-label="Sair da conta">
          Sair
        </button>
      </div>
    </aside>
  );
}
