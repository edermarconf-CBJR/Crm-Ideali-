import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { exigirAtor } from "./ator";
import { ErroDominio } from "../compartilhado/erros";
export async function atorPagina() {
  try {
    return await exigirAtor(await headers());
  } catch (e) {
    if (e instanceof ErroDominio && e.codigo === "NAO_AUTENTICADO")
      redirect("/entrar");
    throw e;
  }
}
