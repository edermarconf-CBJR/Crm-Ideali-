import {executar,json} from '@/servidor/http';import {listarImoveis} from '@/imoveis/consulta';export const dynamic='force-dynamic';
export async function GET(req:Request){return executar(req,async a=>json(await listarImoveis(a,Object.fromEntries(new URL(req.url).searchParams) as never)))}
import {criarImovel} from '@/imoveis/gravacao';export async function POST(req:Request){return executar(req,async a=>json(await criarImovel(a,await req.json()),201))}
