"use client";
import Link from "next/link";
export default function Erro({ reset }: { reset: () => void }) {
  return (
    <section className="painel">
      <h1>Não foi possível carregar esta página</h1>
      <p>
        Se estiver usando filtros, tente limpar a busca. Você também pode tentar
        novamente.
      </p>
      <button className="primario" onClick={reset}>
        Tentar novamente
      </button>{" "}
      <Link className="secundario" href="/imoveis">
        Voltar aos imóveis
      </Link>
    </section>
  );
}
